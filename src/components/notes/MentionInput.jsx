/**
 * ============================================================
 * MENTION INPUT — components/notes/MentionInput.jsx
 * ============================================================
 *
 * A drop-in textarea replacement that adds @mention support.
 * Wraps a plain <textarea> with a positioned dropdown that
 * appears when the user types @.
 *
 * PROPS:
 *   value         {string}    Controlled value
 *   onChange      {Function}  (newValue: string) => void
 *   onKeyDown     {Function}  Optional extra keydown handler (e.g. ⌘Enter to submit)
 *   placeholder   {string}
 *   rows          {number}
 *   disabled      {boolean}
 *   autoFocus     {boolean}
 *   style         {Object}    Inline styles passed to the textarea
 *   className     {string}    Classes passed to the textarea
 *
 * HOW IT WORKS:
 *   1. User types @ → useMentionInput detects the trigger, opens dropdown
 *   2. User types more → debounced search hits GET /api/mentions/users/search?q=
 *   3. Dropdown shows matching users (keyboard or tap to select)
 *   4. On select → @[Name](id) token replaces the @query fragment
 *   5. Final string sent to backend which parses tokens via MENTION_REGEX
 *
 * THE DROPDOWN POSITION:
 *   We position the dropdown ABOVE the textarea (bottom: 100%) so it
 *   doesn't get clipped by the sidebar's overflow:hidden. On very short
 *   sidebars where there's no room above either, it falls back to below.
 *   No external positioning library needed.
 * ============================================================
 */

"use client";

import { forwardRef } from "react";
import { Loader2, AtSign } from "lucide-react";
import { useMentionInput } from "@/hooks/useMentions";
import useAuthStore from "@/store/store";


// ─────────────────────────────────────────────
// USER AVATAR (mini — for the dropdown only)
// ─────────────────────────────────────────────
const DropdownAvatar = ({ user }) => {
  const initials = user.firstName && user.secondName
    ? `${user.firstName[0]}${user.secondName[0]}`.toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "?";

  const hues = [210, 160, 280, 30, 340, 190];
  const hue  = hues[user.id.charCodeAt(0) % hues.length];

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.firstName + " " + user.secondName}
        className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
        style={{ border: `1px solid hsl(${hue} 50% 40% / 0.4)` }}
      />
    );
  }

  return (
    <div
      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold"
      style={{
        background: `hsl(${hue} 60% 22%)`,
        border:     `1px solid hsl(${hue} 50% 35% / 0.5)`,
        color:      `hsl(${hue} 80% 70%)`,
        fontSize:    9,
      }}
    >
      {initials}
    </div>
  );
};

// ─────────────────────────────────────────────
// MENTION DROPDOWN
// ─────────────────────────────────────────────
const MentionDropdown = ({
  users,
  isLoading,
  selectedIndex,
  onSelect,
  onClose,
  query,
}) => {
  const hasResults = users.length > 0;

  return (
    // Backdrop — click outside to close
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="absolute z-50 w-full overflow-hidden"
        style={{
          bottom:       "calc(100% + 4px)",
          left:         0,
          background:   "#111827",
          border:       "1px solid #1e2d40",
          borderRadius: "10px",
          boxShadow:    "0 -4px 24px rgba(0,0,0,0.4)",
          minWidth:     220,
        }}
      >
        {/* Dropdown header */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: "1px solid #1a2538" }}
        >
          <AtSign size={11} style={{ color: "#475569" }} />
          <span className="text-xs" style={{ color: "#475569" }}>
            {isLoading
              ? "Searching…"
              : hasResults
              ? `Mention a user`
              : query
              ? `No users found for "${query}"`
              : "Start typing a name"}
          </span>
          {isLoading && (
            <Loader2 size={11} className="animate-spin ml-auto" style={{ color: "#475569" }} />
          )}
        </div>

        {/* Results list */}
        {hasResults && (
          <ul className="py-1" role="listbox">
            {users.map((user, idx) => (
              <li
                key={user.id}
                role="option"
                aria-selected={idx === selectedIndex}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(user);
                }}
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
                style={{
                  background: idx === selectedIndex ? "#1e2d40" : "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1a2538";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    idx === selectedIndex ? "#1e2d40" : "transparent";
                }}
              >
                <DropdownAvatar user={user} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "#e2e8f0" }}>
                    {user.firstName} {user.secondName}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#475569" }}>
                    {user.email}
                  </p>
                </div>
                {idx === selectedIndex && (
                  <span className="text-xs flex-shrink-0" style={{ color: "#334155" }}>
                    ↵
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Keyboard hint */}
        {hasResults && (
          <div
            className="flex items-center gap-3 px-3 py-1.5"
            style={{ borderTop: "1px solid #1a2538" }}
          >
            {[
              { key: "↑↓", label: "navigate" },
              { key: "↵",  label: "select"   },
              { key: "Esc", label: "dismiss"  },
            ].map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1" style={{ color: "#334155", fontSize: "10px" }}>
                <kbd
                  className="px-1 py-0.5 rounded"
                  style={{ background: "#1e2538", fontSize: "10px", color: "#64748b" }}
                >
                  {key}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────
// MENTION INPUT (MAIN EXPORT)
// ─────────────────────────────────────────────

/**
 * MentionInput
 * Drop-in replacement for <Textarea> in CommentsSidebar.
 * Accepts forwardRef so parent components can call .focus() on it.
 */


const MentionInput = forwardRef(function MentionInput(
  {
    value,
    onChange,
    onKeyDown: externalKeyDown,
    placeholder = "Add a comment… type @ to mention someone",
    rows        = 3,
    disabled    = false,
    autoFocus   = false,
    style       = {},
    className   = "",
  },
  _ref  // external ref (unused here — useMentionInput owns its own ref)
) {
  const user = useAuthStore(state => state.user);
  const currentUserId = user?.user._id;
  const mention = useMentionInput({ value, onChange, currentUserId });

  // Merge the mention keydown handler with any external one
  // (e.g. the ⌘Enter to submit handler from NewCommentInput)
  const handleKeyDown = (e) => {
    mention.handleKeyDown(e);   // dropdown nav (may preventDefault)
    if (!e.defaultPrevented) {
      externalKeyDown?.(e);     // ⌘Enter submit, Escape cancel, etc.
    }
  };

  return (
    // Wrapper must be position:relative so the dropdown can anchor to it
    <div className="relative w-full">
      <textarea
        ref={mention.textareaRef}
        value={value}
        onChange={mention.handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full resize-none outline-none ${className}`}
        style={{
          background:   "#0c0f18",
          border:       "1px solid #1e2538",
          color:        "#cbd5e1",
          borderRadius: "8px",
          fontSize:     "12px",
          padding:      "8px 10px",
          lineHeight:   1.6,
          fontFamily:   "inherit",
          ...style,
        }}
      />

      {/* @ hint — shows briefly when textarea is empty to remind users */}
      {!value && !disabled && (
        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 pointer-events-none"
          style={{ color: "#1e2538" }}
        >
          <AtSign size={11} />
          <span style={{ fontSize: "10px" }}>mention</span>
        </div>
      )}

      {/* Mention dropdown — rendered above the textarea */}
      {mention.isOpen && (
        <MentionDropdown
          users={mention.results}
          isLoading={mention.isSearching}
          selectedIndex={mention.selectedIndex}
          onSelect={mention.selectUser}
          onClose={mention.closeDropdown}
          query={value.slice(
            (value.lastIndexOf("@") ?? 0) + 1,
            mention.textareaRef.current?.selectionStart ?? value.length
          )}
        />
      )}
    </div>
  );
});

export default MentionInput;