/**
 * ============================================================
 * NOTES LIST PAGE — app/[entityType]/[entityId]/notes/page.jsx
 * ============================================================
 *
 * The main notes overview page for a CRM entity.
 * Shows a paginated, searchable, filterable grid of note cards.
 *
 * ROUTE PARAMS:
 *   entityType  → "contact" | "deal" | "company" | "lead"
 *   entityId    → MongoDB ObjectId of the CRM record
 *
 * FEATURES:
 *   - Search (full-text)
 *   - Sort (recent, pinned)
 *   - Filter (pinned, has-whiteboard, has-attachments, archived)
 *   - Create new note button → navigates to editor
 *   - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
 * ============================================================
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Pin,
  PenLine,
  Paperclip,
  Archive,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NoteCard from "@/components/notes/NoteCard";
import { useNotesList } from "@/hooks/useNotes";
import { searchNotes } from "@/services/noteApi";
import useAuthStore from "@/store/store";

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────
const EmptyState = ({ hasFilters, onCreate }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: "#111520", border: "1px solid #1e2538" }}
    >
      <FileText size={24} style={{ color: "#334155" }} strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold mb-2" style={{ color: "#94a3b8" }}>
      {hasFilters ? "No notes match your filters" : "No notes yet"}
    </h3>
    <p className="text-sm mb-6" style={{ color: "#334155", maxWidth: 280 }}>
      {hasFilters
        ? "Try clearing your search or adjusting the filters."
        : "Create your first note — add text, draw on the whiteboard, or attach files."}
    </p>
    {!hasFilters && (
      <Button
        onClick={onCreate}
        style={{
          background: "#7C3AED",
          color: "#ffffff",
          border: "none",
          fontWeight: 600,
          gap: 6,
        }}
      >
        <Plus size={15} />
        New Note
      </Button>
    )}
  </div>
);

// ─────────────────────────────────────────────
// SKELETON CARD
// Placeholder while notes are loading
// ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div
    className="rounded-xl p-4 animate-pulse"
    style={{ background: "#111520", border: "1px solid #1a2035", height: 140 }}
  >
    <div className="h-4 rounded mb-3" style={{ background: "#1e2538", width: "70%" }} />
    <div className="h-3 rounded mb-2" style={{ background: "#1e2538", width: "100%" }} />
    <div className="h-3 rounded mb-4" style={{ background: "#1e2538", width: "85%" }} />
    <div className="flex gap-2">
      <div className="h-4 w-14 rounded" style={{ background: "#1e2538" }} />
      <div className="h-4 w-10 rounded" style={{ background: "#1e2538" }} />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// NOTES LIST PAGE
// ─────────────────────────────────────────────
export default function NotesListPage() {
  const params = useParams();
  const router = useRouter();
  const { entityType, entityId } = params;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.user?._id || null;

  const searchTimer = useRef(null);

  // ── MAIN DATA FETCH ──────────────────────────
  const { notes, pagination, isLoading, mutate } = useNotesList(
    currentUserId,
    { page, sortBy, archived: showArchived }
  );

  // ── SEARCH ───────────────────────────────────
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchNotes(currentUserId, query.trim());
        setSearchResults(res.data || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, [currentUserId]);

  // Decide which list to display
  const displayNotes = searchResults !== null ? searchResults : notes;
  const isActiveSearch = searchQuery.trim().length > 0;
  const hasFilters = isActiveSearch || showArchived;

  const handleCreateNote = () => {
    router.push(`/notes/new`);
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "#2D245B", border: "1px solid #1a2035", borderRadius: "12px" }}
    >
      {/* ── PAGE HEADER ─────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 pt-6 pb-4"
        style={{ borderBottom: "1px solid #1a2035" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "#e2e8f0", letterSpacing: "-0.3px" }}
            >
              Notes
            </h1>
            {pagination && (
              <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                {pagination.total} {pagination.total === 1 ? "note" : "notes"}
              </p>
            )}
          </div>
          <Button
            onClick={handleCreateNote}
            style={{
              background: "#7C3AED",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
              gap: 6,
              height: 40,
              fontSize: "13px",
            }}
          >
            <Plus size={15} />
            New Note
          </Button>
        </div>

        {/* Search + Filter bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#334155" }}
            />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search notes…"
              className="pl-9 pr-9"
              style={{
                background: "#111520",
                border: "1px solid #1e2538",
                color: "#94a3b8",
                height: 40,
                fontSize: "13px",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#94a3b8" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort + Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                style={{
                  background: "#111520",
                  border: "1px solid #1e2538",
                  color: "#94a3b8",
                  height: 40,
                  gap: 6,
                  fontSize: "13px",
                }}
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:block">Filters</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52"
              style={{
                background: "#1a1f2e",
                border: "1px solid #2a3045",
                borderRadius: "10px",
              }}
            >
              <DropdownMenuLabel style={{ color: "#64748b", fontSize: "11px" }}>
                Sort by
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={sortBy === "updatedAt"}
                onCheckedChange={() => setSortBy("updatedAt")}
                style={{ color: "#94a3b8" }}
              >
                Recently updated
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === "createdAt"}
                onCheckedChange={() => setSortBy("createdAt")}
                style={{ color: "#94a3b8" }}
              >
                Date created
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator style={{ background: "#2a3045" }} />
              <DropdownMenuLabel style={{ color: "#64748b", fontSize: "11px" }}>
                Show
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showArchived}
                onCheckedChange={setShowArchived}
                style={{ color: "#94a3b8" }}
              >
                <Archive size={13} className="mr-2" />
                Archived notes
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {(isActiveSearch || showArchived) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {isActiveSearch && (
              <span
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: "#d9770620",
                  border: "1px solid #d9770640",
                  color: "#d97706",
                }}
              >
                <Search size={10} />
                "{searchQuery}"
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  className="ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {showArchived && (
              <span
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: "#ffffff08",
                  border: "1px solid #2a3045",
                  color: "#64748b",
                }}
              >
                <Archive size={10} />
                Archived
                <button
                  type="button"
                  onClick={() => setShowArchived(false)}
                  className="ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        {isLoading || isSearching ? (
          <div className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayNotes.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onCreate={handleCreateNote} />
        ) : (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {displayNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                // entityId={entityId}
                // entityType={entityType}
                onDeleted={mutate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isActiveSearch && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 pb-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              style={{
                background: "#231C46",
                border: "1px solid #1e2538",
                color: "#64748b",
              }}
            >
              Previous
            </Button>
            <span className="text-sm" style={{ color: "#475569" }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                background: "#231C46",
                border: "1px solid #1e2538",
                color: "#64748b",
              }}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}