/**
 * ============================================================
 * useMentions — hooks/useMentions.js
 * ============================================================
 *
 * Two distinct concerns handled here:
 *
 * 1. useMentionInput({ onBodyChange })
 *    Drives the @mention dropdown inside a comment textarea.
 *    Monitors keystrokes, detects @ trigger, debounces the user
 *    search API call, manages dropdown open/close and keyboard
 *    navigation, and inserts the final @[Name](id) token.
 *
 * 2. useMyMentions()
 *    SWR-based hook for fetching the current user's mention feed
 *    (the "shared with me" / notifications list).
 *
 * TOKEN FORMAT (must match backend MENTION_REGEX):
 *   @[Display Name](userId)
 *   e.g. "@[Jane Smith](507f1f77bcf86cd799439011)"
 *
 * HOW THE TEXTAREA TRICK WORKS:
 *   We don't use a custom rich-text editor for comments — just a
 *   plain <textarea>. The mention token is stored as raw text in
 *   the string. The body is sent to the backend as-is; the backend
 *   parses the tokens with MENTION_REGEX. The frontend renders
 *   stored comments through parseMentionBody() which converts tokens
 *   into highlighted React spans for display.
 * ============================================================
 */

import { useState, useRef, useCallback, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { searchUsersForMention, fetchMyMentions, markAllMentionsRead } from "../services/noteApi";

// ─────────────────────────────────────────────
// TOKEN HELPERS
// Used in both the hook and the render layer (CommentsSidebar)
// ─────────────────────────────────────────────

/** Regex matching @[Name](24-hex-char-id) — mirrors backend MENTION_REGEX */
export const MENTION_TOKEN_REGEX = /@\[([^\]]+)\]\(([a-f0-9]{24})\)/g;

/**
 * parseMentionBody
 * Splits a comment body string into an array of segments:
 *   { type: "text",    value: "plain string" }
 *   { type: "mention", value: "@Jane", name: "Jane Smith", userId: "..." }
 *
 * Used by CommentItem to render mention chips inline with the text.
 *
 * @param {string} body
 * @returns {Array<{ type: string, value: string, name?: string, userId?: string }>}
 */
export const parseMentionBody = (body) => {
  if (!body) return [];

  const segments = [];
  let lastIndex  = 0;
  const regex    = new RegExp(MENTION_TOKEN_REGEX.source, "g"); // fresh instance

  let match;
  while ((match = regex.exec(body)) !== null) {
    // Text before this token
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: body.slice(lastIndex, match.index) });
    }
    // The mention token
    segments.push({
      type:   "mention",
      value:  `@${match[1]}`,
      name:   match[1],
      userId: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  // Remaining text after the last token
  if (lastIndex < body.length) {
    segments.push({ type: "text", value: body.slice(lastIndex) });
  }

  return segments;
};

// ─────────────────────────────────────────────
// useMentionInput
// ─────────────────────────────────────────────

/**
 * useMentionInput
 * Provides all the state and handlers needed to add @mention support
 * to a plain <textarea>. Wire it up like this:
 *
 *   const mention = useMentionInput({ value, onChange });
 *
 *   <div style={{ position: "relative" }}>
 *     <textarea
 *       value={value}
 *       onChange={mention.handleChange}
 *       onKeyDown={mention.handleKeyDown}
 *       ref={mention.textareaRef}
 *     />
 *     {mention.isOpen && (
 *       <MentionDropdown
 *         users={mention.results}
 *         isLoading={mention.isSearching}
 *         selectedIndex={mention.selectedIndex}
 *         onSelect={mention.selectUser}
 *         onClose={mention.closeDropdown}
 *       />
 *     )}
 *   </div>
 *
 * @param {Object}   params
 * @param {string}   params.value       - Controlled textarea value (from parent)
 * @param {Function} params.onChange    - (newValue: string) => void
 * @param {string}   params.currentUserId - The ID of the current user
 */
export const useMentionInput = ({ value, onChange, currentUserId }) => {
  const [isOpen,        setIsOpen]        = useState(false);
  const [results,       setResults]       = useState([]);
  const [isSearching,   setIsSearching]   = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // The character position of the @ that triggered the dropdown.
  // We use this to know how much of the string to replace when a
  // user is selected.
  const triggerIndexRef = useRef(-1);

  // Current query text (the chars typed after @)
  const queryRef       = useRef("");
  const debounceTimer  = useRef(null);
  const textareaRef    = useRef(null);

  // ── CLOSE DROPDOWN ─────────────────────────
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setResults([]);
    setSelectedIndex(0);
    triggerIndexRef.current = -1;
    queryRef.current = "";
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  // ── SEARCH ──────────────────────────────────
  const runSearch = useCallback((query) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!query) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const users = await searchUsersForMention(query, currentUserId);
        setResults(users);
        setSelectedIndex(0);
      } catch (err) {
        console.error("[useMentionInput] User search failed:", err.message);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200); // 200ms debounce — snappy for dropdown UX
  }, []);

  // ── HANDLE TEXTAREA CHANGE ──────────────────
  /**
   * handleChange
   * Called on every keystroke. Detects:
   *   - New @ typed → open dropdown, record trigger position
   *   - Typing after @ → update query, re-search
   *   - Space or newline after @ → close dropdown (aborted mention)
   *   - @ deleted → close dropdown
   */
  const handleChange = useCallback((e) => {
    const newValue  = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Look backward from cursor to find the nearest @ that hasn't
    // been followed by a space/newline (which would abort the mention)
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const atIndex          = textBeforeCursor.lastIndexOf("@");

    if (atIndex === -1) {
      // No @ before cursor at all
      if (isOpen) closeDropdown();
      return;
    }

    const textAfterAt = textBeforeCursor.slice(atIndex + 1);

    // If there's a space or newline after @, it's not a mention trigger
    if (/[\s\n]/.test(textAfterAt)) {
      if (isOpen) closeDropdown();
      return;
    }

    // We're in mention-typing mode
    triggerIndexRef.current = atIndex;
    queryRef.current        = textAfterAt;
    setIsOpen(true);
    runSearch(textAfterAt);
  }, [isOpen, onChange, runSearch, closeDropdown]);

  // ── SELECT USER ─────────────────────────────
  /**
   * selectUser
   * Called when the user clicks or keyboard-confirms a result.
   * Replaces the @query fragment in the textarea value with the
   * fully-formed @[Name](userId) token, then closes the dropdown.
   *
   * @param {{ id: string, name: string }} user
   */
  const selectUser = useCallback((user) => {
    if (triggerIndexRef.current === -1) return;

    const cursorPos    = textareaRef.current?.selectionStart ?? value.length;
    const before       = value.slice(0, triggerIndexRef.current);
    const after        = value.slice(cursorPos);
    const token        = `@[${user.name}](${user.id}) `;

    const newValue = before + token + after;
    onChange(newValue);

    // Move cursor to just after the inserted token
    const newCursorPos = before.length + token.length;
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });

    closeDropdown();
  }, [value, onChange, closeDropdown]);

  // ── KEYBOARD NAVIGATION ─────────────────────
  /**
   * handleKeyDown
   * When dropdown is open:
   *   ArrowDown / ArrowUp → move selection
   *   Enter / Tab         → confirm selection
   *   Escape              → close dropdown
   * All other keys fall through to normal textarea behaviour.
   */
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        if (results[selectedIndex]) selectUser(results[selectedIndex]);
        break;
      case "Escape":
        closeDropdown();
        break;
      default:
        break;
    }
  }, [isOpen, results, selectedIndex, selectUser, closeDropdown]);

  // ── CLEANUP ─────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    isOpen,
    results,
    isSearching,
    selectedIndex,
    textareaRef,
    handleChange,
    handleKeyDown,
    selectUser,
    closeDropdown,
  };
};

// ─────────────────────────────────────────────
// useMyMentions
// ─────────────────────────────────────────────

const mentionsFetcher = ([, params]) => fetchMyMentions(params);

/**
 * useMyMentions
 * SWR hook for the current user's mention/notification feed.
 * Used in a "Shared with me" page or a notification bell dropdown.
 *
 * @param {Object} [options]
 * @param {boolean} [options.unread]    - Filter to unread only
 * @param {number}  [options.page]
 * @param {number}  [options.limit]
 */
export const useMyMentions = ({ unread = false, page = 1, limit = 20 } = {}) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ["my-mentions", { unread, page, limit }],
    mentionsFetcher,
    { revalidateOnFocus: true }
  );

  const markAllRead = useCallback(async () => {
    await markAllMentionsRead();
    revalidate();
  }, [revalidate]);

  return {
    mentions:    data?.data?.mentions    ?? [],
    unreadCount: data?.data?.unreadCount ?? 0,
    pagination:  data?.data?.pagination  ?? null,
    isLoading,
    isError:     !!error,
    markAllRead,
    mutate:      revalidate,
  };
};