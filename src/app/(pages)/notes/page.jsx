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

import React, { useState, useCallback, useRef, useEffect } from "react";
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
  Building2,
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
import ConnectClientToNoteDrawer from "@/components/subcomponents/drawers/ConnectClientToNoteDrawer";

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

  // Connect-to-client drawer state
  const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);
  const [connectNoteId, setConnectNoteId] = useState(null);

  // Client filter state
  const [clientFilter, setClientFilter] = useState(null); // { _id, clientName }
  const [clientFilterDrawerOpen, setClientFilterDrawerOpen] = useState(false);

  const searchTimer = useRef(null);

  // ── MAIN DATA FETCH ──────────────────────────
  const { notes, pagination, isLoading, mutate } = useNotesList(
    currentUserId,
    { page, sortBy, archived: showArchived, clientRef: clientFilter?._id || null }
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
  const hasFilters = isActiveSearch || showArchived || !!clientFilter;

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

          {/* Client filter button */}
          <Button
            variant="outline"
            onClick={() => setClientFilterDrawerOpen(true)}
            style={{
              background: clientFilter ? "rgba(127,86,217,0.15)" : "#111520",
              border: clientFilter ? "1px solid rgba(127,86,217,0.4)" : "1px solid #1e2538",
              color: clientFilter ? "#B797FF" : "#94a3b8",
              height: 40,
              gap: 6,
              fontSize: "13px",
            }}
          >
            <Building2 size={14} />
            <span className="hidden sm:block">
              {clientFilter ? (clientFilter.clientName || "Client") : "Client"}
            </span>
          </Button>

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
        {(isActiveSearch || showArchived || clientFilter) && (
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
            {clientFilter && (
              <span
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(127,86,217,0.15)",
                  border: "1px solid rgba(127,86,217,0.4)",
                  color: "#B797FF",
                }}
              >
                <Building2 size={10} />
                {clientFilter.clientName || "Client"}
                <button
                  type="button"
                  onClick={() => { setClientFilter(null); setPage(1); }}
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
                onDeleted={mutate}
                onConnectClient={(n) => {
                  setConnectNoteId(n._id);
                  setConnectDrawerOpen(true);
                }}
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

      {/* Connect to Client Drawer */}
      <ConnectClientToNoteDrawer
        open={connectDrawerOpen}
        onClose={() => { setConnectDrawerOpen(false); setConnectNoteId(null); }}
        noteId={connectNoteId}
        onConnected={() => mutate()}
      />

      {/* Client Filter Picker — reuses the same drawer but picks a client for filtering */}
      <ClientFilterDrawer
        open={clientFilterDrawerOpen}
        onClose={() => setClientFilterDrawerOpen(false)}
        onSelect={(client) => {
          setClientFilter(client);
          setPage(1);
          setClientFilterDrawerOpen(false);
        }}
      />
    </div>
  );
}

// ─── Client Filter Drawer ─────────────────────
// Minimal inline drawer to pick a client for filtering notes
import { useSearchClientsForNote } from "@/hooks/useNoteClient";
import Drawer from "@mui/material/Drawer";

function ClientFilterDrawer({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [fPage, setFPage] = useState(1);

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(query); setFPage(1); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    if (open) { setQuery(""); setDebouncedQuery(""); setFPage(1); }
  }, [open]);

  const { clients, pagination, isLoading } = useSearchClientsForNote(debouncedQuery, fPage, 5);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 400, backgroundColor: "#1E1B38", borderLeft: "1px solid rgba(69,44,149,0.3)" } }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#2D2640]">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#7C3AED]" />
            <h2 className="text-lg font-semibold text-white">Filter by Client</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#2D2640] text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0A1F] border border-[#2D2640] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7C3AED]"
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><span className="text-gray-500 text-sm">Searching...</span></div>
          ) : clients.length === 0 ? (
            <div className="flex items-center justify-center py-12"><span className="text-gray-500 text-sm">{debouncedQuery ? "No matches" : "Type to search"}</span></div>
          ) : (
            <div className="flex flex-col gap-2">
              {clients.map((c) => (
                <button
                  key={c._id}
                  onClick={() => onSelect(c)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#2D2640] bg-[#0F0A1F] hover:border-[#7C3AED] transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(c.clientName || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{c.clientName || "Unnamed"}</div>
                    <div className="text-xs text-gray-500">{[c.city, c.state].filter(Boolean).join(", ")}</div>
                  </div>
                </button>
              ))}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button onClick={() => setFPage(Math.max(1, fPage - 1))} disabled={fPage === 1} className="text-xs text-gray-500 disabled:opacity-40">Prev</button>
                  <span className="text-xs text-gray-600">{fPage}/{pagination.totalPages}</span>
                  <button onClick={() => setFPage(Math.min(pagination.totalPages, fPage + 1))} disabled={fPage >= pagination.totalPages} className="text-xs text-gray-500 disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}