"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiPath } from "@/utils/routes";
import useAuthStore from "@/store/store";
import { formatDistanceToNow } from "date-fns";
import Swal from "sweetalert2";
import {
  Plus,
  ArrowRight,
  MoreVertical,
  Pin,
  Archive,
  Trash2,
  FileText,
  PenLine,
  Search,
  X,
  Building2,
  Link2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useNotesList } from "@/hooks/useNotes";
import { deleteNoteById, updateNoteStatus } from "@/hooks/useNoteClient";
import ConnectClientToNoteDrawer from "@/components/subcomponents/drawers/ConnectClientToNoteDrawer";
import * as noteApi from "@/services/noteApi";

// ─── Note Row ────────────────────────────────────────────────────────────────

function NoteRow({ note, onOpen, onDeleted, userId }) {
  const hasWb =
    note.whiteboardContent?.elements?.length > 0;
  const updatedAgo = note.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : "";

  const handleDelete = async (e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      icon: "warning",
      text: "Delete this note?",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteNoteById(note._id);
      Swal.fire({ icon: "success", text: "Note deleted", timer: 1200, showConfirmButton: false });
      onDeleted?.();
    } catch {
      Swal.fire({ icon: "error", text: "Failed to delete" });
    }
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      await updateNoteStatus(note._id, { isPinned: !note.isPinned, userId });
      onDeleted?.();
    } catch {}
  };

  const handleToggleArchive = async (e) => {
    e.stopPropagation();
    try {
      await updateNoteStatus(note._id, { isArchived: !note.isArchived, userId });
      onDeleted?.();
    } catch {}
  };

  return (
    <div className="nw-note-row" onClick={() => onOpen(note)}>
      <div className={`nw-note-thumb ${hasWb ? "nw-thumb-wb" : "nw-thumb-txt"}`}>
        {hasWb ? <PenLine size={12} /> : <FileText size={12} />}
      </div>
      <div className="nw-note-content">
        <div className="nw-note-title">
          {note.isPinned && <Pin size={10} className="nw-pin-icon" />}
          {note.title || "Untitled Note"}
        </div>
        <div className="nw-note-meta">
          <span>{updatedAgo}</span>
          {note.tags?.length > 0 && (
            <span className="nw-note-tag">{note.tags[0]}</span>
          )}
          {note.clientRef && (
            <span className="nw-note-client">
              <Building2 size={9} /> {typeof note.clientRef === "object" ? (note.clientRef.clientName || "Connected") : "Connected"}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="nw-note-action"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical size={13} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onOpen(note);
            }}
          >
            Open
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTogglePin}>
            {note.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleArchive}>
            {note.isArchived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-400">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Main Widget ─────────────────────────────────────────────────────────────

export default function NotesWidget() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.user?._id || "";
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimer = useRef(null);

  // Connect drawer state
  const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);
  const [connectNoteId, setConnectNoteId] = useState(null);

  // Adding note
  const [addTitle, setAddTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const LIMIT = 8;

  const { notes, pagination, isLoading, mutate } = useNotesList(userId, {
    page,
    limit: LIMIT,
    sortBy: "updatedAt",
    archived: false,
  });

  const handleSearch = useCallback(
    (q) => {
      setSearchQuery(q);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (!q.trim()) {
        setSearchResults(null);
        return;
      }
      searchTimer.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await noteApi.searchNotes(q.trim());
          setSearchResults(res.data || []);
        } catch {
          console.error("Search failed");
        } finally {
          setIsSearching(false);
        }
      }, 400);
    },
    []
  );

  const handleOpen = (note) => {
    router.push(`/notes/${note._id}`);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!addTitle.trim()) return;
    setAdding(true);
    try {
      await noteApi.createNote({ title: addTitle.trim(), userId });
      setAddTitle("");
      setShowAdd(false);
      mutate();
    } catch {
      Swal.fire({ icon: "error", text: "Failed to create note" });
    } finally {
      setAdding(false);
    }
  };

  const displayNotes = searchResults !== null ? searchResults : notes;

  // Sort: pinned first, then by updatedAt
  const sortedNotes = [...displayNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return (
    <>
      <style jsx global>{`
        .nw-search-bar {
          padding: 10px 16px 6px;
          border-bottom: 1px solid rgba(69,44,149,.12);
        }
        .nw-search-wrap {
          position: relative;
        }
        .nw-search-icon {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          color: #6F618F; pointer-events: none;
        }
        .nw-search-input {
          width: 100%; padding: 7px 32px 7px 32px;
          border-radius: 9px; font-size: 12px;
          background: rgba(15,10,31,0.6); border: 1px solid rgba(69,44,149,0.25);
          color: #fff; outline: none; transition: border-color .15s;
        }
        .nw-search-input:focus { border-color: rgba(127,86,217,0.5); }
        .nw-search-input::placeholder { color: #6F618F; }
        .nw-search-clear {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          background: none; border: 0; color: #6F618F; cursor: pointer;
        }

        .nw-scroll-area { max-height: 380px; overflow-y: auto; padding: 8px 12px 12px 16px; }
        .nw-scroll-area::-webkit-scrollbar { width: 4px; }
        .nw-scroll-area::-webkit-scrollbar-track { background: transparent; }
        .nw-scroll-area::-webkit-scrollbar-thumb { background: rgba(127,86,217,.3); border-radius: 4px; }

        .nw-note-row {
          display: grid; grid-template-columns: 36px 1fr 24px;
          gap: 12px; align-items: center;
          padding: 8px 12px; border-radius: 10px;
          transition: background .15s; cursor: pointer;
        }
        .nw-note-row:hover { background: rgba(127,86,217,.1); }

        .nw-note-thumb {
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .nw-thumb-txt { background: linear-gradient(135deg, #94A3B8, #475569); color: #fff; }
        .nw-thumb-wb { background: linear-gradient(135deg, #FB923C, #C2410C); color: #fff; }

        .nw-note-content { min-width: 0; line-height: 1.3; }
        .nw-note-title {
          font-size: 13px; font-weight: 500; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          display: flex; align-items: center; gap: 4px;
        }
        .nw-pin-icon { color: #d97706; flex-shrink: 0; }
        .nw-note-meta { font-size: 11px; color: #6F618F; margin-top: 1px; display: flex; gap: 8px; align-items: center; }
        .nw-note-tag {
          font-size: 9.5px; font-weight: 500;
          padding: 1px 6px; border-radius: 9999px;
          background: rgba(56,189,248,.12); border: 1px solid rgba(56,189,248,.25);
          color: #38bdf8;
        }
        .nw-note-client {
          font-size: 9.5px; display: flex; align-items: center; gap: 2px;
          color: #B797FF;
        }

        .nw-note-action {
          width: 24px; height: 24px; border-radius: 6px;
          background: transparent; border: 0; color: #6F618F;
          display: inline-flex; align-items: center; justify-content: center;
          opacity: 0; transition: all .15s; cursor: pointer;
        }
        .nw-note-row:hover .nw-note-action { opacity: 1; }
        .nw-note-action:hover { background: rgba(127,86,217,.2); color: #fff; }

        .nw-foot {
          padding: 10px 14px 14px;
          border-top: 1px solid rgba(69,44,149,.12);
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .nw-foot-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 9px;
          background: rgba(127,86,217,.15); border: 1px solid rgba(69,44,149,.3);
          color: #B797FF; font-weight: 600; font-size: 12px;
          cursor: pointer; transition: all .15s;
        }
        .nw-foot-cta:hover { background: rgba(127,86,217,.28); color: #fff; }
        .nw-foot-link {
          background: transparent; border: 0; color: #6F618F;
          font-size: 12px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .nw-foot-link:hover { color: #B797FF; }
        .nw-empty { padding: 24px 14px; color: #6F618F; font-size: 12.5px; text-align: center; }
        .nw-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 8px 0 4px;
        }
        .nw-pagination button {
          background: rgba(127,86,217,.08); border: 1px solid rgba(127,86,217,.25);
          border-radius: 6px; padding: 4px 10px; font-size: 11px;
          color: #B797FF; cursor: pointer; transition: all .15s;
        }
        .nw-pagination button:disabled { opacity: 0.4; cursor: default; }
        .nw-pagination button:hover:not(:disabled) { background: rgba(127,86,217,.2); }
        .nw-pagination span { font-size: 11px; color: #6F618F; }

        .nw-add-form {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px 0;
        }
        .nw-add-input {
          flex: 1; padding: 7px 12px; border-radius: 8px;
          font-size: 12px; background: rgba(15,10,31,0.6);
          border: 1px solid rgba(69,44,149,0.25); color: #fff; outline: none;
        }
        .nw-add-input:focus { border-color: rgba(127,86,217,0.5); }
        .nw-add-input::placeholder { color: #6F618F; }
        .nw-add-btn {
          padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          background: #7C3AED; border: 0; color: #fff; cursor: pointer;
        }
        .nw-add-btn:disabled { opacity: 0.5; }
        .nw-add-cancel {
          background: none; border: 0; color: #6F618F; font-size: 12px; cursor: pointer;
        }
      `}</style>

      {/* Search */}
      <div className="nw-search-bar">
        <div className="nw-search-wrap">
          <Search size={13} className="nw-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes..."
            className="nw-search-input"
          />
          {searchQuery && (
            <button
              className="nw-search-clear"
              onClick={() => handleSearch("")}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Add note form */}
      {showAdd && (
        <form onSubmit={handleAddNote} className="nw-add-form">
          <input
            type="text"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            placeholder="Note title..."
            className="nw-add-input"
            autoFocus
          />
          <button type="submit" disabled={adding || !addTitle.trim()} className="nw-add-btn">
            {adding ? "..." : "Add"}
          </button>
          <button type="button" onClick={() => { setShowAdd(false); setAddTitle(""); }} className="nw-add-cancel">
            Cancel
          </button>
        </form>
      )}

      {/* Note list */}
      <div className="nw-scroll-area">
        {isLoading || isSearching ? (
          <div className="nw-empty">Loading...</div>
        ) : sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <NoteRow
              key={note._id}
              note={note}
              onOpen={handleOpen}
              onDeleted={() => mutate()}
              userId={userId}
            />
          ))
        ) : (
          <div className="nw-empty">
            {searchQuery ? "No notes match your search" : "No notes yet"}
          </div>
        )}

        {/* Pagination */}
        {!searchQuery && pagination && pagination.totalPages > 1 && (
          <div className="nw-pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="nw-foot">
        <button className="nw-foot-cta" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> New note
        </button>
        <button
          className="nw-foot-link"
          onClick={() => router.push("/notes")}
        >
          View all notes <ArrowRight size={14} />
        </button>
      </div>

      {/* Connect drawer */}
      <ConnectClientToNoteDrawer
        open={connectDrawerOpen}
        onClose={() => {
          setConnectDrawerOpen(false);
          setConnectNoteId(null);
        }}
        noteId={connectNoteId}
        onConnected={() => mutate()}
      />
    </>
  );
}
