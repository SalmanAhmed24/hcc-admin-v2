/**
 * ============================================================
 * NOTE API SERVICE — services/noteApi.js
 * ============================================================
 *
 * Every HTTP call related to Notes lives here.
 * Components and hooks import from this file — never call
 * axios directly from a component.
 *
 * FORMDATA PATTERN:
 *   Notes are sent as multipart/form-data because they can
 *   include file attachments. Every field — even plain strings
 *   and JSON objects — must be appended as form data.
 *
 *   JSON objects (richTextContent, whiteboardContent, tags) are
 *   stringified before appending, then parsed back by the backend.
 *
 * AUTH:
 *   The axios instance reads the JWT from localStorage and sets
 *   the Authorization header automatically on every request.
 * ============================================================
 */

import axios from "axios";
import { NOTE_ROUTES, MENTION_ROUTES } from "@/utils/routes";

// ─────────────────────────────────────────────
// AXIOS INSTANCE
// Pre-configured with auth header injection.
// Replace "token" key with whatever your auth system uses.
// ─────────────────────────────────────────────
const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────
// HELPER: buildNoteFormData
// Converts a note payload object into a FormData instance.
// Called by createNote() and updateNote().
//
// @param {Object} payload
// @param {File[]} [files]  - New file attachments
// @returns {FormData}
// ─────────────────────────────────────────────
const buildNoteFormData = (payload, files = []) => {
  const fd = new FormData();

  // Scalar fields
  if (payload.title !== undefined) fd.append("title", payload.title || "dahboard");
  // if (payload.crmEntityId) fd.append("crmEntityId", payload.crmEntityId || "64a1b");
  // if (payload.crmEntityType) fd.append("crmEntityType", payload.crmEntityType || "contact");
  if (payload.userId) fd.append("userId", payload.userId);

  if (payload.isPinned !== undefined)
    fd.append("isPinned", String(payload.isPinned));
  if (payload.isArchived !== undefined)
    fd.append("isArchived", String(payload.isArchived));

  if (payload.richTextContent !== undefined)
    fd.append(
      "richTextContent",
      payload.richTextContent ? JSON.stringify(payload.richTextContent) : ""
    );

  if (payload.whiteboardContent !== undefined)
    fd.append(
      "whiteboardContent",
      payload.whiteboardContent
        ? JSON.stringify(payload.whiteboardContent)
        : ""
    );

  if (payload.tags !== undefined)
    fd.append("tags", JSON.stringify(payload.tags || []));
  files.forEach((file) => fd.append("attachments", file));

  return fd;
};

// ─────────────────────────────────────────────
// GET NOTES LIST
// ─────────────────────────────────────────────

/**
 * fetchNotesList
 * Fetches paginated notes for a CRM entity.
 * Does NOT include whiteboard/richText content (list view only).
 *
 * @param {Object} params
 * @param {string} params.entityId
 * @param {string} params.entityType
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {string} [params.sortBy]
 * @param {boolean} [params.archived]
 *
 * @returns {Promise<{ notes, pagination }>}
 */
export const fetchNotesList = async ({
  createdBy,
  page = 1,
  limit = 20,
  sortBy = "updatedAt",
  archived = false,
}) => {
  const { data } = await apiClient.get(NOTE_ROUTES.list, {
    params: { createdBy, page, limit, sortBy, archived },
  });
  return data; // { success, data: notes[], pagination }
};

// ─────────────────────────────────────────────
// GET SINGLE NOTE
// ─────────────────────────────────────────────

/**
 * fetchNoteById
 * Fetches a complete note including whiteboard content and all attachments.
 * Attachments will have fresh presigned URLs attached by the backend.
 *
 * @param {string} noteId
 * @returns {Promise<Object>} Full note object
 */
export const fetchNoteById = async (noteId) => {
  const { data } = await apiClient.get(NOTE_ROUTES.byId(noteId));
  return data; // { success, data: note }
};

// ─────────────────────────────────────────────
// CREATE NOTE
// ─────────────────────────────────────────────

/**
 * createNote
 * Creates a new note with optional file attachments.
 * Sent as multipart/form-data.
 *
 * @param {Object} payload
 * @param {string} payload.crmEntityId
 * @param {string} payload.crmEntityType
 * @param {string} [payload.title]
 * @param {Object} [payload.richTextContent]   - Tiptap JSON
 * @param {Object} [payload.whiteboardContent] - Excalidraw JSON
 * @param {string[]} [payload.tags]
 * @param {File[]} [files]
 * @param {Function} [onUploadProgress]        - (percent: number) => void
 *
 * @returns {Promise<Object>} Created note
 */
export const createNote = async (payload, files = [], onUploadProgress) => {
  const fd = buildNoteFormData(payload, files);

  const { data } = await apiClient.post(NOTE_ROUTES.list, fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onUploadProgress
      ? (e) => {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          onUploadProgress(pct);
        }
      : undefined,
  });

  return data; // { success, data: note, message }
};

// ─────────────────────────────────────────────
// UPDATE NOTE
// ─────────────────────────────────────────────

/**
 * updateNote
 * Updates an existing note. All fields optional.
 * New files are appended to existing attachments.
 * Called by auto-save and manual save.
 *
 * @param {string} noteId
 * @param {Object} payload   - Only include fields that changed
 * @param {File[]} [files]   - New files to attach
 * @param {Function} [onUploadProgress]
 *
 * @returns {Promise<Object>} Updated note
 */
export const updateNote = async (
  noteId,
  payload,
  files = [],
  onUploadProgress
) => {
  const fd = buildNoteFormData(payload, files);

  const { data } = await apiClient.put(NOTE_ROUTES.byId(noteId), fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onUploadProgress
      ? (e) => {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          onUploadProgress(pct);
        }
      : undefined,
  });

  return data;
};

// ─────────────────────────────────────────────
// DELETE NOTE
// ─────────────────────────────────────────────

/**
 * deleteNote
 * Permanently deletes a note and all its S3 files.
 *
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export const deleteNote = async (noteId) => {
  await apiClient.delete(NOTE_ROUTES.byId(noteId));
  console.log(`Note ${noteId} deleted`);
};

// ─────────────────────────────────────────────
// DELETE ATTACHMENT
// ─────────────────────────────────────────────

/**
 * deleteAttachment
 * Removes one file from a note (S3 + database).
 *
 * @param {string} noteId
 * @param {string} attachmentId
 * @param {string} userId
 * @returns {Promise<Object>} Updated note
 */
export const deleteAttachment = async (noteId, attachmentId, userId) => {
  const { data } = await apiClient.delete(
    NOTE_ROUTES.attachment(noteId, attachmentId, userId)
  );
  return data;
};

// ─────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────

/**
 * addComment
 * Adds a comment to a note. Sent as JSON (not FormData).
 *
 * @param {string} noteId
 * @param {Object} payload
 * @param {string} payload.body
 * @param {string} [payload.anchorType] - "text"|"canvas"|"attachment"|"general"
 * @param {string} [payload.anchorId]
 *
 * @returns {Promise<Object>} New comment
 */
export const addComment = async (noteId, payload) => {
  const { data } = await apiClient.post(NOTE_ROUTES.comments(noteId), payload);
  return data;
};

/**
 * addReply
 * Adds a reply to a comment thread.
 *
 * @param {string} noteId
 * @param {string} commentId
 * @param {string} body
 * @returns {Promise<Object>} Updated comment with replies
 */
export const addReply = async (noteId, commentId, currentUserId, body) => {
  const { data } = await apiClient.post(
    NOTE_ROUTES.replies(noteId, commentId, currentUserId),
    { body }
  );
  return data;
};

/**
 * resolveComment
 * Marks a comment thread as resolved.
 *
 * @param {string} noteId
 * @param {string} commentId
 * @returns {Promise<Object>} Updated comment
 */
export const resolveComment = async (noteId, commentId) => {
  const { data } = await apiClient.patch(
    NOTE_ROUTES.resolveComment(noteId, commentId)
  );
  return data;
};

/**
 * deleteComment
 * @param {string} noteId
 * @param {string} commentId
 * @param {string} currentUserId
 */
export const deleteCommentApi = async (noteId, commentId, currentUserId) => {
  await apiClient.delete(NOTE_ROUTES.deleteComment(noteId, commentId, currentUserId));
};

// ─────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────

/**
 * searchNotes
 * Full-text search within a CRM entity's notes.
 *
 * @param {string} entityId
 * @param {string} entityType
 * @param {string} query
 * @returns {Promise<Object[]>}
 */
export const searchNotes = async (query) => {
  const { data } = await apiClient.get(NOTE_ROUTES.search, {
    params: { q: query },
  });
  return data;
};

/**
 * refreshPresignedUrl
 * Fetches a fresh presigned URL for an S3 key that has expired.
 *
 * @param {string} s3Key
 * @returns {Promise<string>} Fresh URL
 */
export const refreshPresignedUrl = async (s3Key) => {
  const { data } = await apiClient.get(NOTE_ROUTES.presigned, {
    params: { key: s3Key },
  });
  return data.data.url;
};

// ─────────────────────────────────────────────
// MENTIONS
// ─────────────────────────────────────────────
 
/**
 * fetchMyMentions
 * Fetches the paginated list of mentions for the current user.
 * Used in a notifications feed or "shared with me" view.
 *
 * @param {Object} params
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {boolean} [params.unread]  - Filter to unread only
 * @returns {Promise<{ mentions, unreadCount, pagination }>}
 */
export const fetchMyMentions = async ({ page = 1, limit = 20, unread = false } = {}) => {
  const { data } = await apiClient.get(MENTION_ROUTES.list, {
    params: { page, limit, unread },
  });
  return data;
};
 
/**
 * markMentionRead
 * Marks a single mention as read.
 *
 * @param {string} mentionId
 * @returns {Promise<Object>}
 */
export const markMentionRead = async (mentionId) => {
  const { data } = await apiClient.patch(MENTION_ROUTES.markRead(mentionId));
  return data;
};
 
/**
 * markAllMentionsRead
 * Marks all of the current user's unread mentions as read.
 *
 * @returns {Promise<{ updatedCount: number }>}
 */
export const markAllMentionsRead = async () => {
  const { data } = await apiClient.patch(MENTION_ROUTES.readAll);
  return data;
};
 
/**
 * searchUsersForMention
 * Searches app users by name/email for the @ dropdown.
 * Called on every keystroke after @ is typed in a comment.
 *
 * @param {string} query  - The text typed after @
 * @returns {Promise<Array<{ id, name, email, avatar }>>}
 */
export const searchUsersForMention = async (query, currentUserId) => {
  if (!query || query.trim().length < 1) return [];
  const { data } = await apiClient.get(MENTION_ROUTES.userSearch(currentUserId), {
    params: { q: query.trim() },
  });
  return data.data || [];
};