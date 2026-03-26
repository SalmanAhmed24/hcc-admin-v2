/**
 * ============================================================
 * NOTE CARD — components/notes/NoteCard.jsx
 * ============================================================
 * Preview card shown in the Notes List grid.
 * Displays title, content preview, tags, metadata, and quick actions.
 * Clicking the card navigates to the full editor.
 * ============================================================
 */

"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Pin,
  MessageSquare,
  Paperclip,
  PenLine,
  MoreHorizontal,
  Archive,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNoteActions } from "@/hooks/useNotes";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * extractTextPreview
 * Extracts plain text from Tiptap JSON content for the card preview.
 * Walks the document tree and collects text nodes.
 *
 * @param {Object|null} richTextContent - Tiptap JSON doc node
 * @param {number} maxLength
 * @returns {string}
 */
const extractTextPreview = (richTextContent, maxLength = 120) => {
  if (!richTextContent) return "";

  // Parse if it's a JSON string (common when reading from DB)
  let doc = richTextContent;
  if (typeof richTextContent === "string") {
    try {
      doc = JSON.parse(richTextContent);
    } catch {
      // It's a plain string (not rich text), return it directly
      return richTextContent.length > maxLength
        ? richTextContent.slice(0, maxLength) + "…"
        : richTextContent;
    }
  }

  const walk = (node) => {
    if (!node) return "";
    if (node.type === "text") return node.text || "";
    if (Array.isArray(node.content)) return node.content.map(walk).join(" ");
    return "";
  };

  const text = walk(doc).replace(/\s+/g, " ").trim();
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
};

/**
 * hasWhiteboardContent
 * Returns true if the note has any Excalidraw elements drawn.
 */
const hasWhiteboardContent = (whiteboardContent) => {
  return whiteboardContent?.elements?.length > 0;
};

// ─────────────────────────────────────────────
// WHITEBOARD MINI PREVIEW
// A tiny SVG that sketches a visual indicator for notes
// that have whiteboard content — gives the card a visual distinction.
// ─────────────────────────────────────────────
const WhiteboardPreviewThumb = () => (
  <div className="h-16 w-full rounded-md mb-3 overflow-hidden relative"
    style={{ background: "linear-gradient(135deg, #1a1f2e 0%, #1e2538 100%)", border: "1px solid #2a3045" }}>
    <svg
      viewBox="0 0 280 64"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20,40 Q55,15 90,32 Q125,48 155,22 Q185,5 215,28"
        stroke="#d97706"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M25,50 Q70,44 110,48"
        stroke="#d97706"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.35"
      />
      <rect
        x="195"
        y="18"
        width="60"
        height="28"
        rx="3"
        fill="#d9770610"
        stroke="#d9770630"
        strokeWidth="1"
      />
    </svg>
    <div
      className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
      style={{ background: "#d9770618", color: "#d97706" }}
    >
      <PenLine size={9} />
      <span style={{ fontSize: "10px" }}>Whiteboard</span>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// NOTE CARD
// ─────────────────────────────────────────────
export default function NoteCard({ note, onDeleted }) {
  const router = useRouter();
  const { deleteNote, togglePin, toggleArchive, isDeleting } = useNoteActions(
    note._id
  );

  const textPreview = extractTextPreview(note.richTextContent);
  const hasWb = hasWhiteboardContent(note.whiteboardContent);
  const updatedAgo = note.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : "";

  const handleCardClick = (e) => {
    // Don't navigate if the dropdown was clicked
    if (e.target.closest("[data-dropdown]")) return;
    router.push(`/notes/${note._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this note? This cannot be undone.")) return;
    await deleteNote();
    onDeleted?.();
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col cursor-pointer rounded-xl transition-all duration-200"
      style={{
        background: "#0F0A1F",
        border: note.isPinned ? "1px solid #d9770640" : "1px solid #1e2538",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = note.isPinned
          ? "1px solid #d97706aa"
          : "1px solid #2a3550";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = note.isPinned
          ? "1px solid #d9770640"
          : "1px solid #1e2538";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Pinned accent strip */}
      {note.isPinned && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
          style={{ background: "linear-gradient(90deg, #d97706, transparent)" }}
        />
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Whiteboard thumb — only if note has canvas content */}
        {hasWb && <WhiteboardPreviewThumb />}

        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="font-semibold leading-snug flex-1 line-clamp-2"
            style={{ fontSize: "14px", color: "#e2e8f0" }}
          >
            {note.title || "Untitled Note"}
          </h3>

          <div className="flex items-center gap-1 flex-shrink-0">
            {note.isPinned && (
              <Pin size={13} style={{ color: "#d97706" }} />
            )}

            {/* Action dropdown */}
            <div data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/5"
                    style={{ color: "#64748b" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44"
                  style={{
                    background: "#1a1f2e",
                    border: "1px solid #2a3045",
                    borderRadius: "10px",
                  }}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(note.isPinned);
                    }}
                    className="gap-2 text-slate-300 focus:text-white focus:bg-white/5"
                  >
                    <Pin size={13} />
                    {note.isPinned ? "Unpin" : "Pin note"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArchive(note.isArchived);
                    }}
                    className="gap-2 text-slate-300 focus:text-white focus:bg-white/5"
                  >
                    <Archive size={13} />
                    {note.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: "#2a3045" }} />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="gap-2 focus:bg-red-950/40"
                    style={{ color: "#f87171" }}
                  >
                    <Trash2 size={13} />
                    {isDeleting ? "Deleting…" : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Text preview */}
        {textPreview && (
          <p
            className="text-xs leading-relaxed mb-3 line-clamp-3"
            style={{ color: "#64748b" }}
          >
            {textPreview}
          </p>
        )}

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0 h-5 font-normal"
                style={{
                  background: "#0f1824",
                  border: "1px solid #1e3a5f",
                  color: "#38bdf8",
                  borderRadius: "5px",
                }}
              >
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs" style={{ color: "#475569" }}>
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: metadata */}
        <div
          className="flex items-center gap-3 mt-auto pt-2"
          style={{ borderTop: "1px solid #1e2538" }}
        >
          {note.attachmentCount > 0 && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "#475569" }}
            >
              <Paperclip size={11} />
              {note.attachmentCount}
            </span>
          )}
          {note.openCommentCount > 0 && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "#475569" }}
            >
              <MessageSquare size={11} />
              {note.openCommentCount}
            </span>
          )}
          <span className="ml-auto text-xs" style={{ color: "#334155" }}>
            {updatedAgo}
          </span>
        </div>
      </div>
    </div>
  );
}