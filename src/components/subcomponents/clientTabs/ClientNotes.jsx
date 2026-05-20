"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  FileText,
  Pin,
  Archive,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  PenLine,
  Paperclip,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  useNotesByClient,
  addNoteFromClient,
  deleteNoteById,
  updateNoteStatus,
} from "@/hooks/useNoteClient";
import useAuthStore from "@/store/store";
import Swal from "sweetalert2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractTextPreview = (richTextContent, maxLength = 100) => {
  if (!richTextContent) return "";
  let doc = richTextContent;
  if (typeof richTextContent === "string") {
    try { doc = JSON.parse(richTextContent); } catch { return richTextContent.slice(0, maxLength); }
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

const hasWhiteboardContent = (wb) => wb?.elements?.length > 0;

// ─── Add Note Form ───────────────────────────────────────────────────────────

function AddNoteForm({ clientId, userId, onAdded }) {
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    try {
      await addNoteFromClient(clientId, { title: title.trim(), userId });
      Swal.fire({ icon: "success", text: "Note created", timer: 1200, showConfirmButton: false });
      setTitle("");
      setShow(false);
      onAdded?.();
    } catch (err) {
      Swal.fire({ icon: "error", text: "Failed to create note" });
    } finally {
      setAdding(false);
    }
  };

  if (!show) {
    return (
      <Button
        onClick={() => setShow(true)}
        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-2"
        size="sm"
      >
        <Plus size={14} /> Add Note
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="flex-1 px-3 py-2 rounded-lg bg-[#0F0A1F] border border-[#2D2640] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7C3AED]"
        autoFocus
      />
      <Button
        type="submit"
        disabled={adding || !title.trim()}
        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
        size="sm"
      >
        {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
      </Button>
      <Button
        type="button"
        onClick={() => { setShow(false); setTitle(""); }}
        variant="outline"
        size="sm"
        className="border-[#2D2640] text-gray-400 hover:bg-[#2D2640] hover:text-white bg-transparent"
      >
        Cancel
      </Button>
    </form>
  );
}

// ─── Note Tile Card ──────────────────────────────────────────────────────────

function NoteTile({ note, onDeleted, userId }) {
  const router = useRouter();
  const [acting, setActing] = useState(false);

  const handleClick = (e) => {
    if (e.target.closest("[data-dropdown]")) return;
    router.push(`/notes/${note._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      icon: "warning",
      text: "Delete this note? This cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteNoteById(note._id);
      Swal.fire({ icon: "success", text: "Note deleted", timer: 1200, showConfirmButton: false });
      onDeleted?.();
    } catch {
      Swal.fire({ icon: "error", text: "Failed to delete note" });
    }
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    setActing(true);
    try {
      await updateNoteStatus(note._id, { isPinned: !note.isPinned, userId });
      onDeleted?.(); // revalidate
    } catch {
      Swal.fire({ icon: "error", text: "Failed to update note" });
    } finally {
      setActing(false);
    }
  };

  const handleToggleArchive = async (e) => {
    e.stopPropagation();
    setActing(true);
    try {
      await updateNoteStatus(note._id, { isArchived: !note.isArchived, userId });
      onDeleted?.();
    } catch {
      Swal.fire({ icon: "error", text: "Failed to update note" });
    } finally {
      setActing(false);
    }
  };

  const textPreview = extractTextPreview(note.richTextContent);
  const hasWb = hasWhiteboardContent(note.whiteboardContent);
  const updatedAgo = note.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : "";

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col cursor-pointer rounded-xl transition-all duration-200 hover:-translate-y-[1px]"
      style={{
        background: "#0F0A1F",
        border: note.isPinned ? "1px solid #d9770640" : "1px solid #1e2538",
      }}
    >
      {note.isPinned && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
      )}
      <div className="p-4 flex flex-col flex-1">
        {hasWb && (
          <div className="h-10 w-full rounded-md mb-2 flex items-center justify-center text-xs gap-1" style={{ background: "#1a1f2e", border: "1px solid #2a3045", color: "#d97706" }}>
            <PenLine size={10} /> Whiteboard
          </div>
        )}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold leading-snug flex-1 line-clamp-2 text-sm text-[#e2e8f0]">
            {note.title || "Untitled Note"}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {note.isPinned && <Pin size={13} style={{ color: "#d97706" }} />}
            <div data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/5 text-[#64748b]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44" style={{ background: "#1a1f2e", border: "1px solid #2a3045", borderRadius: "10px" }}>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/notes/${note._id}`); }} className="gap-2 text-slate-300 focus:text-white focus:bg-white/5">
                    <ExternalLink size={13} /> Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleTogglePin} disabled={acting} className="gap-2 text-slate-300 focus:text-white focus:bg-white/5">
                    <Pin size={13} /> {note.isPinned ? "Unpin" : "Pin note"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleArchive} disabled={acting} className="gap-2 text-slate-300 focus:text-white focus:bg-white/5">
                    <Archive size={13} /> {note.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: "#2a3045" }} />
                  <DropdownMenuItem onClick={handleDelete} className="gap-2 focus:bg-red-950/40" style={{ color: "#f87171" }}>
                    <Trash2 size={13} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {textPreview && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-3 text-[#64748b]">{textPreview}</p>
        )}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0 h-5 font-normal" style={{ background: "#0f1824", border: "1px solid #1e3a5f", color: "#38bdf8", borderRadius: "5px" }}>
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && <span className="text-xs text-[#475569]">+{note.tags.length - 3}</span>}
          </div>
        )}
        <div className="flex items-center gap-3 mt-auto pt-2" style={{ borderTop: "1px solid #1e2538" }}>
          {(note.attachmentCount > 0 || note.attachments?.length > 0) && (
            <span className="flex items-center gap-1 text-xs text-[#475569]">
              <Paperclip size={11} /> {note.attachmentCount || note.attachments?.length}
            </span>
          )}
          {(note.commentCount > 0 || note.comments?.length > 0) && (
            <span className="flex items-center gap-1 text-xs text-[#475569]">
              <MessageSquare size={11} /> {note.commentCount || note.comments?.length}
            </span>
          )}
          <span className="ml-auto text-xs text-[#334155]">{updatedAgo}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Note List Row ───────────────────────────────────────────────────────────

function NoteListRow({ note, onDeleted, userId }) {
  const router = useRouter();
  const [acting, setActing] = useState(false);

  const updatedAgo = note.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : "";

  const handleDelete = async (e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      icon: "warning", text: "Delete this note?", showCancelButton: true, confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteNoteById(note._id);
      onDeleted?.();
    } catch {
      Swal.fire({ icon: "error", text: "Failed to delete" });
    }
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    setActing(true);
    try { await updateNoteStatus(note._id, { isPinned: !note.isPinned, userId }); onDeleted?.(); } catch {} finally { setActing(false); }
  };

  return (
    <div
      onClick={() => router.push(`/notes/${note._id}`)}
      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:border-[#7C3AED] transition-all group"
      style={{ background: "#0F0A1F", borderColor: note.isPinned ? "#d9770640" : "#1e2538" }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: hasWhiteboardContent(note.whiteboardContent) ? "#d9770618" : "#111520", border: "1px solid #1e2538" }}>
        {hasWhiteboardContent(note.whiteboardContent) ? <PenLine size={14} style={{ color: "#d97706" }} /> : <FileText size={14} style={{ color: "#64748b" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#e2e8f0] truncate">{note.title || "Untitled"}</span>
          {note.isPinned && <Pin size={11} style={{ color: "#d97706" }} />}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#475569] mt-0.5">
          <span>{updatedAgo}</span>
          {note.tags?.length > 0 && <span className="text-[#38bdf8]">{note.tags[0]}</span>}
        </div>
      </div>
      <div data-dropdown className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/5 text-[#64748b]" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40" style={{ background: "#1a1f2e", border: "1px solid #2a3045", borderRadius: "10px" }}>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/notes/${note._id}`); }} className="gap-2 text-slate-300 focus:text-white focus:bg-white/5">
              <ExternalLink size={13} /> Open
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleTogglePin} disabled={acting} className="gap-2 text-slate-300 focus:text-white focus:bg-white/5">
              <Pin size={13} /> {note.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "#2a3045" }} />
            <DropdownMenuItem onClick={handleDelete} className="gap-2 focus:bg-red-950/40" style={{ color: "#f87171" }}>
              <Trash2 size={13} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ClientNotes({ item, open }) {
  const clientId = item?._id;
  const user = useAuthStore((state) => state.user);
  const userId = user?.user?._id || null;
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const { notes, pagination, isLoading, mutate } = useNotesByClient(clientId, page, 12);

  const refresh = useCallback(() => mutate(), [mutate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
        <p className="text-gray-400 text-sm">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Notes</h2>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-[#2D2640] overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-[#7C3AED] text-white" : "bg-transparent text-gray-500 hover:text-white"}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-[#7C3AED] text-white" : "bg-transparent text-gray-500 hover:text-white"}`}
            >
              <List size={14} />
            </button>
          </div>
          <Button onClick={refresh} size="sm" variant="outline" className="border-[#2D2640] text-gray-400 hover:bg-[#2D2640] hover:text-white bg-transparent">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Add Note Form */}
      <div className="mb-4">
        <AddNoteForm clientId={clientId} userId={userId} onAdded={refresh} />
      </div>

      {/* Notes Display */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(127,86,217,0.12)] flex items-center justify-center">
            <FileText className="w-7 h-7 text-[#7C3AED]" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-semibold text-lg">No Notes Yet</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              Create your first note for this client using the form above.
            </p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {notes.map((note) => (
            <NoteTile key={note._id} note={note} onDeleted={refresh} userId={userId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteListRow key={note._id} note={note} onDeleted={refresh} userId={userId} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-8 h-8 rounded-lg bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)] text-[#E1C9FF] flex items-center justify-center disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="w-8 h-8 rounded-lg bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)] text-[#E1C9FF] flex items-center justify-center disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
