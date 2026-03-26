/**
 * ============================================================
 * NOTE HOOKS — hooks/useNotes.js
 * ============================================================
 *
 * All data-fetching and mutation hooks for the Notes feature.
 * We use SWR for GET requests (caching, revalidation, loading states)
 * and plain async functions wrapped in local state for mutations.
 *
 * HOOKS EXPORTED:
 *  useNotesList      → paginated list of notes for an entity
 *  useNote           → single note (full content)
 *  useSaveNote       → debounced auto-save + manual save
 *  useNoteActions    → delete, pin, archive
 *  useComments       → add/reply/resolve/delete comments
 *  useAttachments    → delete attachments, refresh presigned URLs
 * ============================================================
 */

import { useState, useCallback, useRef, useEffect } from "react";
import useSWR, { mutate } from "swr";
import * as noteApi from "@/services/noteApi";
import { useNoteStore } from "@/store/noteStore";

// ─────────────────────────────────────────────
// SWR FETCHER
// SWR calls this with the key (URL) and expects a promise.
// We wrap our API calls so SWR can use them.
// ─────────────────────────────────────────────
const listFetcher = ([, params]) => noteApi.fetchNotesList(params);
const noteFetcher = ([, id]) => noteApi.fetchNoteById(id);

// ─────────────────────────────────────────────
// useNotesList
// ─────────────────────────────────────────────

/**
 * Fetches the paginated notes list for a CRM entity.
 *
 * @param {string} entityId
 * @param {string} entityType
 * @param {Object} [options]  - page, limit, sortBy, archived
 *
 * @returns {{ notes, pagination, isLoading, isError, mutate }}
 */
export const useNotesList = (currentUserId, options = {}) => {
  const { page = 1, limit = 20, sortBy = "updatedAt", archived = false } = options;

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    currentUserId
      ? ["notes-list", { createdBy: currentUserId, page, limit, sortBy, archived }]
      : null,
    listFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    notes: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    isError: !!error,
    mutate: revalidate,
  };
};

// ─────────────────────────────────────────────
// useNote
// ─────────────────────────────────────────────

/**
 * Fetches a single complete note.
 *
 * @param {string} noteId
 * @returns {{ note, isLoading, isError, mutate }}
 */
export const useNote = (noteId) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    noteId ? ["note", noteId] : null,
    noteFetcher,
    {
      revalidateOnFocus: false,
      // Don't auto-revalidate while editing — user controls save
      revalidateOnReconnect: false,
    }
  );

  return {
    note: data?.data || null,
    isLoading,
    isError: !!error,
    mutate: revalidate,
  };
};

// ─────────────────────────────────────────────
// useSaveNote
// ─────────────────────────────────────────────

/**
 * Provides auto-save (debounced) and manual save for the note editor.
 *
 * AUTO-SAVE BEHAVIOUR:
 *   - Debounced: waits 2 seconds after the last change before saving
 *   - Cancels pending auto-save if a manual save fires first
 *   - Does not save if content hasn't changed (isDirty = false)
 *
 * @param {string} noteId    - null for new (unsaved) notes
 * @param {string} entityId
 * @param {string} entityType
 *
 * @returns {{ save, autoSave, isSaving }}
 */
export const useSaveNote = (noteId) => {
  const { setDirty, setSaveStatus, pendingFiles, clearPendingFiles, setUploadProgress } =
    useNoteStore();

  const [isSaving, setIsSaving] = useState(false);
  const debounceTimer = useRef(null);
  const currentNoteId = useRef(noteId); // tracks ID after first create

  // Keep ref in sync (noteId can change after first create)
  useEffect(() => {
    currentNoteId.current = noteId;
  }, [noteId]);

  /**
   * save
   * Performs the actual API call (create or update).
   * Called by both autoSave and the manual Save button.
   *
   * @param {Object} content   - { title, richTextContent, whiteboardContent, tags, ... }
   * @param {File[]} [files]   - New files to attach (from pendingFiles store)
   * @returns {Promise<Object>} Saved note (may have a new ID if just created)
   */
  const save = useCallback(
    async (content, files = []) => {
      // Cancel any pending debounce
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      setIsSaving(true);
      setSaveStatus("saving");

      try {
        const allFiles = [...files, ...pendingFiles];

        const onProgress = allFiles.length > 0
          ? (pct) => {
              allFiles.forEach((f) => setUploadProgress(f.name, pct));
            }
          : undefined;

        let result;

        if (!currentNoteId.current) {
          result = await noteApi.createNote(
            { ...content },
            allFiles,
            onProgress
          );
          currentNoteId.current = result.data.id;
        } else {
          result = await noteApi.updateNote(
            currentNoteId.current,
            content,
            allFiles,
            onProgress
          );
        }

        clearPendingFiles();
        setDirty(false);
        setSaveStatus("saved");

        // Revalidate the SWR cache for this note
        mutate(["note", currentNoteId.current]);
        // mutate(["notes-list", { entityId, entityType }]);

        // Reset save status indicator after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);

        return result.data;
      } catch (err) {
        setSaveStatus("error");
        console.error("[useSaveNote] Save failed:", err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [
      pendingFiles,
      clearPendingFiles,
      setDirty,
      setSaveStatus,
      setUploadProgress,
    ]
  );

  /**
   * autoSave
   * Debounced version of save. Call this from editor onChange handlers.
   * Resets the 2-second timer on every call.
   *
   * @param {Object} content
   */
  const autoSave = useCallback(
    (content) => {
      setDirty(true);
      setSaveStatus("idle");

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        save(content).catch(() => {}); // errors handled inside save()
      }, 2000);
    },
    [save, setDirty, setSaveStatus]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return { save, autoSave, isSaving };
};

// ─────────────────────────────────────────────
// useNoteActions
// ─────────────────────────────────────────────

/**
 * delete, pin, archive actions for a note.
 *
 * @param {string} noteId
 * @param {string} entityId
 * @param {string} entityType
 */
export const useNoteActions = (noteId) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteNote = useCallback(async () => {
    setIsDeleting(true);
    try {
      await noteApi.deleteNote(noteId);
      // Invalidate the list cache
      // mutate(["notes-list", { entityId, entityType }]);
    } finally {
      setIsDeleting(false);
    }
  }, [noteId]);

  const togglePin = useCallback(
    async (currentIsPinned) => {
      await noteApi.updateNote(noteId, { isPinned: !currentIsPinned });
      mutate(["note", noteId]);
      // mutate(["notes-list", { entityId, entityType }]);
    },
    [noteId]
  );

  const toggleArchive = useCallback(
    async (currentIsArchived) => {
      await noteApi.updateNote(noteId, { isArchived: !currentIsArchived });
      mutate(["note", noteId]);
      // mutate(["notes-list", { entityId, entityType }]);
    },
    [noteId]
  );

  return { deleteNote, togglePin, toggleArchive, isDeleting };
};

// ─────────────────────────────────────────────
// useComments
// ─────────────────────────────────────────────

/**
 * Comment mutations — add, reply, resolve, delete.
 * After each mutation, revalidates the note SWR cache.
 *
 * @param {string} noteId
 */
export const useComments = (noteId) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = useCallback(
    async ({ body, anchorType = "general", anchorId = null, currentUserId }) => {
      setIsSubmitting(true);
      try {
        const result = await noteApi.addComment(noteId, {
          body,
          anchorType,
          anchorId,
          currentUserId,
        });
        mutate(["note", noteId]);
        return result.data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [noteId]
  );

  const addReply = useCallback(
    async (commentId, currentUserId, body) => {
      setIsSubmitting(true);
      try {
        await noteApi.addReply(noteId, commentId, currentUserId, body);
        mutate(["note", noteId]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [noteId]
  );

  const resolveComment = useCallback(
    async (commentId) => {
      await noteApi.resolveComment(noteId, commentId);
      mutate(["note", noteId]);
    },
    [noteId]
  );

  const deleteComment = useCallback(
    async (commentId, currentUserId) => {
      await noteApi.deleteCommentApi(noteId, commentId, currentUserId);
      mutate(["note", noteId]);
    },
    [noteId]
  );

  return { addComment, addReply, resolveComment, deleteComment, isSubmitting };
};

// ─────────────────────────────────────────────
// useAttachments
// ─────────────────────────────────────────────

/**
 * Attachment mutations.
 *
 * @param {string} noteId
 */
export const useAttachments = (noteId) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const removeAttachment = useCallback(
    async (attachmentId, userId) => {
      setIsDeleting(true);
      try {
        await noteApi.deleteAttachment(noteId, attachmentId, userId);
        mutate(["note", noteId]);
      } finally {
        setIsDeleting(false);
      }
    },
    [noteId]
  );

  const refreshUrl = useCallback(async (s3Key) => {
    return noteApi.refreshPresignedUrl(s3Key);
  }, []);

  return { removeAttachment, refreshUrl, isDeleting };
};