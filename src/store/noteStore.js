/**
 * ============================================================
 * NOTE STORE — store/noteStore.js
 * ============================================================
 *
 * Zustand store that manages UI state for the note editor.
 * This is NOT a data-fetching store — note data lives in SWR hooks.
 * This store handles transient UI state that needs to be shared
 * across sibling components without prop-drilling.
 *
 * WHAT LIVES HERE:
 *  - Editor mode (text vs whiteboard)
 *  - Dirty / unsaved state
 *  - Save status (saving, saved, error)
 *  - Active comment ID (for scrolling/highlighting)
 *  - Sidebar open/closed
 *  - Upload progress per file
 *
 * WHAT DOES NOT LIVE HERE:
 *  - Note data (fetched by useNote hook via SWR)
 *  - Comments data (part of the note document)
 *  - Attachment data (part of the note document)
 *
 * USAGE:
 *   import { useNoteStore } from "@/store/noteStore";
 *   const { editorMode, setEditorMode } = useNoteStore();
 * ============================================================
 */

import { create } from "zustand";

export const useNoteStore = create((set, get) => ({
  // ── EDITOR MODE ──────────────────────────────────────────
  // Which panel is currently active/visible.
  // "text"       → Tiptap rich text editor
  // "whiteboard" → Excalidraw canvas
  editorMode: "text",
  setEditorMode: (mode) => set({ editorMode: mode }),

  // ── DIRTY STATE ──────────────────────────────────────────
  // true when there are unsaved changes.
  // Used to show the "Unsaved changes" indicator and warn on navigation.
  isDirty: false,
  setDirty: (dirty) => set({ isDirty: dirty }),

  // ── SAVE STATUS ──────────────────────────────────────────
  // "idle"    → no recent save activity
  // "saving"  → save request in flight
  // "saved"   → last save succeeded (shown for ~2 seconds then resets)
  // "error"   → last save failed
  saveStatus: "idle",
  setSaveStatus: (status) => set({ saveStatus: status }),

  // ── COMMENTS SIDEBAR ─────────────────────────────────────
  isCommentSidebarOpen: true,
  toggleCommentSidebar: () =>
    set((s) => ({ isCommentSidebarOpen: !s.isCommentSidebarOpen })),
  setCommentSidebarOpen: (open) => set({ isCommentSidebarOpen: open }),

  // ── ACTIVE COMMENT ───────────────────────────────────────
  // ID of the comment currently highlighted/focused.
  // When a user clicks a comment pin on the canvas, this is set
  // so the sidebar can scroll to and highlight that comment.
  activeCommentId: null,
  setActiveCommentId: (id) => set({ activeCommentId: id }),

  // ── UPLOAD PROGRESS ──────────────────────────────────────
  // Map of { [filename]: progressPercent (0-100) }
  // Cleared when upload completes.
  uploadProgress: {},
  setUploadProgress: (filename, percent) =>
    set((s) => ({
      uploadProgress: { ...s.uploadProgress, [filename]: percent },
    })),
  clearUploadProgress: () => set({ uploadProgress: {} }),

  // ── ATTACHMENT PANEL ─────────────────────────────────────
  isAttachmentPanelOpen: false,
  toggleAttachmentPanel: () =>
    set((s) => ({ isAttachmentPanelOpen: !s.isAttachmentPanelOpen })),

  // ── PENDING NEW FILES ────────────────────────────────────
  // Files selected by the user but not yet uploaded.
  // Held here until the next save is triggered.
  pendingFiles: [],
  addPendingFiles: (files) =>
    set((s) => ({ pendingFiles: [...s.pendingFiles, ...files] })),
  clearPendingFiles: () => set({ pendingFiles: [] }),
  removePendingFile: (name) =>
    set((s) => ({
      pendingFiles: s.pendingFiles.filter((f) => f.name !== name),
    })),

  // ── RESET ────────────────────────────────────────────────
  // Call this when navigating away from the editor to reset
  // all transient state cleanly.
  reset: () =>
    set({
      editorMode: "text",
      isDirty: false,
      saveStatus: "idle",
      isCommentSidebarOpen: true,
      activeCommentId: null,
      uploadProgress: {},
      isAttachmentPanelOpen: false,
      pendingFiles: [],
    }),
}));