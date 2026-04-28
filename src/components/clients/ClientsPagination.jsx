/*
 * ClientsPagination
 * ─────────────────
 * Pagination controls for the clients list.
 *
 * DISPLAYS:
 *   "Showing 1–20 of 347 clients"
 *   [←] [1] [2] [3] … [18] [→]
 *
 * PAGE WINDOW LOGIC:
 *   Shows at most 5 page numbers with ellipsis. The current page is always
 *   visible, with 1-2 pages on each side. First and last page always shown.
 *
 *   Page 1 of 18:  [1] [2] [3] … [18]
 *   Page 5 of 18:  [1] … [4] [5] [6] … [18]
 *   Page 18 of 18: [1] … [16] [17] [18]
 *
 * FILE LOCATION: src/components/clients/ClientsPagination.jsx
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export default function ClientsPagination({ pagination, onPageChange }) {
  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;

  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  // Calculate display range
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Build page numbers array with ellipsis
  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between">
      <div className="text-[12px] text-[#6F618F]">
        Showing{" "}
        <span className="text-white font-medium">{from}–{to}</span>
        {" "}of{" "}
        <span className="text-white font-medium">{total}</span>
        {" "}clients
      </div>

      <div className="flex items-center gap-1.5">
        {/* Prev button */}
        <PageBtn
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          wide
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </PageBtn>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="text-[#6F618F] text-[12px] px-1">
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              active={p === page}
              onClick={() => onPageChange(p)}
            >
              {p}
            </PageBtn>
          )
        )}

        {/* Next button */}
        <PageBtn
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          wide
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </PageBtn>
      </div>
    </div>
  );
}

/* ── Page button sub-component ───────────────────────────────────── */

function PageBtn({ children, active, disabled, onClick, wide }) {
  return (
    <button
      className={cn(
        "h-9 rounded-lg border text-[13px] font-medium transition-all",
        "flex items-center justify-center cursor-pointer",
        wide ? "px-3" : "w-9",
        active
          ? "bg-gradient-to-b from-[rgba(127,86,217,0.5)] to-[rgba(127,86,217,0.25)] text-white border-[#B797FF]"
          : "bg-[rgba(20,15,43,0.5)] text-[#A99BD4] border-[rgba(69,44,149,0.45)] hover:bg-[rgba(127,86,217,0.2)] hover:text-white",
        disabled && "opacity-30 cursor-not-allowed pointer-events-none"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/* ── Page numbers builder ────────────────────────────────────────── */

function buildPageNumbers(current, total) {
  if (total <= 7) {
    // Show all pages if 7 or fewer
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  // Always show page 1
  pages.push(1);

  if (current > 3) {
    pages.push("...");
  }

  // Show pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  // Always show last page
  pages.push(total);

  return pages;
}