"use client";

import React, { useState, useCallback, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import {
  Search,
  X,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Link2,
} from "lucide-react";
import { useSearchClientsForNote, connectNoteToClient } from "@/hooks/useNoteClient";
import Swal from "sweetalert2";

const PAGE_LIMIT = 5;

function ClientRow({ client, onSelect, selecting }) {
  const displayName = client.clientName || "Unnamed";

  const initials = (displayName)
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      onClick={() => onSelect(client)}
      disabled={selecting}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#2D2640] bg-[#0F0A1F] hover:border-[#7C3AED] hover:bg-[rgba(127,86,217,0.06)] transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-semibold truncate">
          {displayName}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          {client.city && client.state && (
            <span className="flex items-center gap-0.5 flex-shrink-0">
              <MapPin className="w-3 h-3" />
              {client.city}, {client.state}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {client.status && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(127,86,217,0.15)] border border-[rgba(127,86,217,0.35)] text-[#B797FF]">
            {client.status}
          </span>
        )}
        <Link2 className="w-4 h-4 text-gray-600 group-hover:text-[#7C3AED] transition-colors" />
      </div>
    </button>
  );
}

function MiniPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-3">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-7 h-7 rounded-lg bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)] text-[#E1C9FF] flex items-center justify-center disabled:opacity-40"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-xs text-gray-500">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-7 h-7 rounded-lg bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)] text-[#E1C9FF] flex items-center justify-center disabled:opacity-40"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default function ConnectClientToNoteDrawer({ open, onClose, noteId, onConnected }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { clients, pagination, isLoading } = useSearchClientsForNote(
    debouncedQuery,
    page,
    PAGE_LIMIT
  );

  const handleSelect = useCallback(
    async (client) => {
      if (!noteId) return;
      setSelecting(true);
      try {
        await connectNoteToClient(noteId, client._id);
        const name = client.clientName || "client";
        Swal.fire({
          icon: "success",
          text: `Connected to ${name}`,
          timer: 1500,
          showConfirmButton: false,
        });
        onConnected?.();
        onClose();
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to connect client";
        Swal.fire({ icon: "error", text: msg });
      } finally {
        setSelecting(false);
      }
    },
    [noteId, onConnected, onClose]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setPage(1);
    }
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          backgroundColor: "#1E1B38",
          borderLeft: "1px solid rgba(69,44,149,0.3)",
        },
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#2D2640]">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#7C3AED]" />
            <h2 className="text-lg font-semibold text-white">Connect Note to Client</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#2D2640] text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by company, contact, city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0A1F] border border-[#2D2640] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#7C3AED] transition-colors"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {pagination.total > 0 && (
            <p className="text-[11px] text-gray-600 mt-2 px-1">
              {pagination.total} client{pagination.total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
              <span className="text-gray-500 text-sm">Searching...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Building2 className="w-10 h-10 text-gray-700" />
              <p className="text-gray-500 text-sm">
                {debouncedQuery ? "No clients match your search" : "No clients found"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {clients.map((client) => (
                <ClientRow
                  key={client._id}
                  client={client}
                  onSelect={handleSelect}
                  selecting={selecting}
                />
              ))}
              <MiniPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
