/**
 * ============================================================
 * NOTE EDITOR — components/notes/NoteEditor.jsx
 * ============================================================
 *
 * The main orchestrator component for the note editing experience.
 * It wires together:
 *   - RichTextEditor  (Tiptap)
 *   - WhiteboardEditor (Excalidraw)
 *   - CommentsSidebar
 *   - AttachmentPanel
 *   - Top toolbar (mode toggle, save button, title input)
 *
 * STATE OWNERSHIP:
 *   - Editor content (title, richText, whiteboard) → local useState
 *     (kept local because it changes on every keystroke; syncing to
 *     global store on every keystroke would cause re-renders elsewhere)
 *   - UI state (mode, sidebar, dirty) → Zustand (noteStore)
 *   - Server data → SWR via useNote hook
 *
 * SAVE FLOW:
 *   onChange → autoSave (debounced 2s) → useSaveNote.save()
 *   Save button → immediate flush → useSaveNote.save()
 *   Cmd+S → preventDefault → immediate flush
 *
 * KEYBOARD SHORTCUTS:
 *   ⌘S / Ctrl+S  → Save now
 *   ⌘⇧W         → Switch to whiteboard
 *   ⌘⇧T         → Switch to text
 * ============================================================
 */

"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  PenLine,
  FileText,
  MessageSquare,
  Paperclip,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Pin,
  Tag,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import RichTextEditor from "./RichTextEditor";
import WhiteboardEditor from "./WhiteboardEditor";
import CommentsSidebar from "./CommentsSidebar";
import AttachmentPanel from "./AttachmentPanel";
import VoiceRecorder from "./VoiceRecorder";

import { useNote } from "@/hooks/useNotes";
import { useSaveNote } from "@/hooks/useNotes";
import { useNoteStore } from "@/store/noteStore";
import useAuthStore from "@/store/store";


// ─────────────────────────────────────────────
// SAVE STATUS INDICATOR
// Small indicator in the top bar showing save state.
// ─────────────────────────────────────────────

const SaveIndicator = ({ status, isDirty }) => {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
        <Loader2 size={12} className="animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs" style={{ color: "#34d399" }}>
        <CheckCircle size={12} />
        Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs" style={{ color: "#f87171" }}>
        <AlertCircle size={12} />
        Save failed
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="text-xs" style={{ color: "#475569" }}>
        Unsaved changes
      </span>
    );
  }
  return null;
};

// ─────────────────────────────────────────────
// MODE TOGGLE
// Large segmented control — tablet-friendly touch targets.
// ─────────────────────────────────────────────
const ModeToggle = ({ mode, onChange }) => {
  const modes = [
    { key: "text",       label: "Text",       icon: <FileText size={14} /> },
    { key: "whiteboard", label: "Whiteboard", icon: <PenLine size={14} /> },
  ];

  return (
    <div
      className="flex rounded-lg p-0.5 gap-0.5"
      style={{ background: "#231C46", border: "1px solid #1e2538" }}
    >
      {modes.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => onChange(m.key)}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all"
          style={{
            background: mode === m.key ? "#7C3AED" : "transparent",
            color: mode === m.key ? "#ffffff" : "#475569",
            minWidth: 110,
            justifyContent: "center",
          }}
        >
          {m.icon}
          {m.label}
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAG INPUT
// Inline tag chip input bar.
// ─────────────────────────────────────────────
const TagInput = ({ tags, onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (value) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 15) return;
    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag size={12} style={{ color: "#334155" }} />
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="gap-1 px-2 py-0 h-5 text-xs cursor-pointer font-normal"
          style={{
            background: "#0f1824",
            border: "1px solid #1e3a5f",
            color: "#38bdf8",
            borderRadius: "5px",
          }}
          onClick={() => removeTag(tag)}
          title="Click to remove"
        >
          {tag} ×
        </Badge>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
          }
          if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
          }
        }}
        onBlur={() => inputValue && addTag(inputValue)}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        className="outline-none bg-transparent text-xs"
        style={{ color: "#64748b", minWidth: 70, maxWidth: 120 }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// NOTE EDITOR (MAIN EXPORT)
// ─────────────────────────────────────────────
export default function NoteEditor({
  noteId,          // null for new notes
  entityId,
  entityType,
  currentUserId,
  breadcrumb,      // [{ label, href }] for the breadcrumb trail
  onCreated,       // (newNote) => void — called after first save of a new note
}) {
  const router = useRouter();
  const {
    editorMode, setEditorMode,
    isDirty, setDirty,
    saveStatus,
    isCommentSidebarOpen, toggleCommentSidebar, setCommentSidebarOpen,
    isAttachmentPanelOpen, toggleAttachmentPanel,
    pendingFiles,
    reset,
  } = useNoteStore();

  // Fetch note data (null for new notes)
  const { note, isLoading } = useNote(noteId);
  const { save, autoSave, isSaving } = useSaveNote(noteId, entityId, entityType);

  // Local content state — initialised from DB once note loads
  const [title, setTitle] = useState("");
  const [richTextContent, setRichTextContent] = useState(null);
  const [whiteboardContent, setWhiteboardContent] = useState(null);
  const [tags, setTags] = useState([]);
  const isInitialised = useRef(false);

  // ── VOICE-TO-TEXT REF ────────────────────────
  // We hold a ref to the RichTextEditor instance so we can call
  // insertText() on it imperatively when a voice transcript arrives.
  // This avoids passing the transcript through props, which would
  // cause the whole editor tree to re-render and lose cursor position.
  const richTextEditorRef = useRef(null);

  /**
   * handleTranscript
   * Called by VoiceRecorder when the user stops speaking (or clicks
   * "Insert now"). Inserts the transcribed text at the Tiptap cursor.
   * Also marks the note dirty and triggers auto-save, exactly the same
   * as a manual keystroke would.
   */
  const handleTranscript = useCallback((text) => {
    if (!text) return;
    // Insert into Tiptap via the imperative ref
    richTextEditorRef.current?.insertText(text);
    // Mark dirty — the editor's onChange will fire and trigger autoSave
    setDirty(true);
  }, [setDirty]);

  // Initialise local state from fetched note (runs once when note loads)
  useEffect(() => {
    if (note && !isInitialised.current) {
      setTitle(note.title || "");
      setRichTextContent(note.richTextContent || null);
      setWhiteboardContent(note.whiteboardContent || null);
      setTags(note.tags || []);
      isInitialised.current = true;
    }
  }, [note]);

  // Reset store on unmount
  useEffect(() => () => reset(), [reset]);

  // ── KEYBOARD SHORTCUTS ───────────────────────
  useEffect(() => {
    const handler = (e) => {
      // ⌘S or Ctrl+S → save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
      // ⌘⇧W → whiteboard mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "w") {
        e.preventDefault();
        setEditorMode("whiteboard");
      }
      // ⌘⇧T → text mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "t") {
        e.preventDefault();
        setEditorMode("text");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // ── WARN BEFORE LEAVING WITH UNSAVED CHANGES ─
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ── CONTENT HELPERS ──────────────────────────
  
  const buildContent = useCallback(() => ({
    title,
    richTextContent,
    whiteboardContent,
    tags,
    userId : currentUserId,
  }), [title, richTextContent, whiteboardContent, tags]);

  const handleManualSave = useCallback(async () => {
    try {
      const savedNote = await save(buildContent(), pendingFiles);
      // If this was a new note, navigate to its permanent URL
      if (!noteId && savedNote?.id) {
        onCreated?.(savedNote);
        router.replace(`notes/${savedNote.id}`);
      }
    } catch (err) {
      console.error("Manual save failed:", err);
    }
  }, [save, buildContent, pendingFiles, noteId, entityType, entityId, router, onCreated]);

  // ── RICH TEXT CHANGE HANDLER ─────────────────
  const handleRichTextChange = useCallback((json) => {
    setRichTextContent(json);
    setDirty(true);
    autoSave(buildContent());
  }, [setDirty, autoSave, buildContent]);

  // ── WHITEBOARD CHANGE HANDLER ────────────────
  const handleWhiteboardChange = useCallback((scene) => {
    setWhiteboardContent(scene);
    setDirty(true);
    autoSave({ ...buildContent(), whiteboardContent: scene });
  }, [setDirty, autoSave, buildContent]);

  // ── TITLE CHANGE ─────────────────────────────
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setDirty(true);
    autoSave({ ...buildContent(), title: e.target.value });
  };

  // ── TAGS CHANGE ──────────────────────────────
  const handleTagsChange = (newTags) => {
    setTags(newTags);
    setDirty(true);
    autoSave({ ...buildContent(), tags: newTags });
  };

  // ── LOADING STATE ────────────────────────────
  if (noteId && isLoading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "#0c0f18" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "#1e2538", borderTopColor: "#d97706" }}
          />
          <span style={{ color: "#334155", fontSize: "13px" }}>Loading note…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: "100vh", background: "#2D245B", overflow: "hidden", border: "1px solid #1a2035", borderRadius: "12px" }}
    >
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
        style={{
          background: "#2D245B",
          borderBottom: "1px solid #1a2035",
          minHeight: 56,
        }}
      >
        <button
          type="button"
          onClick={() => router.push(`/notes`)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "#ffffff", flexShrink: 0 }}
        >
          <ArrowLeft size={15} />
          <span className="text-sm hidden sm:block">Notes</span>
        </button>

        <div className="flex-1 flex justify-center">
          <ModeToggle mode={editorMode} onChange={setEditorMode} />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <SaveIndicator status={saveStatus} isDirty={isDirty} />

          <VoiceRecorder
            onTranscript={handleTranscript}
            disabled={editorMode !== "text"}
          />

          <button
            type="button"
            onClick={toggleAttachmentPanel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: isAttachmentPanelOpen ? "#1e2538" : "transparent",
              color: isAttachmentPanelOpen ? "#e2e8f0" : "#475569",
              border: "1px solid",
              borderColor: isAttachmentPanelOpen ? "#2a3550" : "transparent",
              position: "relative",
            }}
            title="Attachments"
          >
            <Paperclip size={15} />
            {pendingFiles.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                style={{ background: "#d97706", color: "#000", fontSize: "10px" }}
              >
                {pendingFiles.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={toggleCommentSidebar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: isCommentSidebarOpen ? "#1e2538" : "transparent",
              color: isCommentSidebarOpen ? "#e2e8f0" : "#475569",
              border: "1px solid",
              borderColor: isCommentSidebarOpen ? "#2a3550" : "transparent",
            }}
            title="Comments (⌘⇧C)"
          >
            <MessageSquare size={15} />
            {note?.openCommentCount > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: "#d9770620", color: "#d97706", fontSize: "10px" }}
              >
                {note.openCommentCount}
              </span>
            )}
          </button>

          <Button
            onClick={handleManualSave}
            disabled={isSaving || (!isDirty && pendingFiles.length === 0)}
            className="gap-2"
            style={{
              background: isDirty || pendingFiles.length > 0 ? "#7C3AED" : "#1e2538",
              color: isDirty || pendingFiles.length > 0 ? "#ffffff" : "#334155",
              border: "none",
              height: 36,
              paddingLeft: 16,
              paddingRight: 16,
              fontSize: "13px",
              fontWeight: 600,
              transition: "background 0.2s",
            }}
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </Button>
        </div>
      </div>
      <div
        className="flex-shrink-0 px-8 py-4"
        style={{ borderBottom: "1px solid #1a2035" }}
      >
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title…"
          className="w-full bg-transparent outline-none font-semibold"
          style={{
            fontSize: "22px",
            color: "#e2e8f0",
            letterSpacing: "-0.3px",
            marginBottom: "10px",
          }}
        />
        <TagInput tags={tags} onChange={handleTagsChange} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <AttachmentPanel note={note} isOpen={isAttachmentPanelOpen} />
          <div className="flex-1 overflow-hidden">
            {editorMode === "text" ? (
              <RichTextEditor
                ref={richTextEditorRef}
                content={richTextContent}
                onChange={handleRichTextChange}
                editable={true}
              />
            ) : (
              <WhiteboardEditor
                content={whiteboardContent}
                onChange={handleWhiteboardChange}
                editable={true}
              />
            )}
          </div>
        </div>
        {note && (
          <CommentsSidebar
            note={note}
            currentUserId={currentUserId}
            isOpen={isCommentSidebarOpen}
            onClose={() => setCommentSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}