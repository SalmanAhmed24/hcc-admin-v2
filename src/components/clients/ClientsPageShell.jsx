/*
 * ClientsPageShell
 * ────────────────
 * The "brain" of the clients dashboard. This Client Component owns all
 * state and orchestrates every child component.
 *
 * ARCHITECTURE:
 *   page.jsx (Server Component) → renders ClientsPageShell
 *   ClientsPageShell (Client Component) → owns useClients hook + drawers
 *     ├── ClientsFilterBar → reads/writes filter state
 *     ├── ClientRowCard × N → renders each client
 *     ├── ClientsPagination → page navigation
 *     ├── AssignResearchDrawer → manager assigns research
 *     └── Loading/Error/Empty states
 *
 * WHY "use client" ONLY HERE:
 *   Next.js Server Components can't use hooks, event handlers, or
 *   browser APIs. We push "use client" as far down as possible —
 *   the page.jsx stays a Server Component (fast initial render, SEO),
 *   and this shell is the boundary where client-side interactivity begins.
 *
 * DATA FLOW:
 *   URL params → useClients hook → SWR key → API fetch → data
 *   User interaction → handler → update URL → useClients re-reads → SWR refetch
 *
 * SUSPENSE FIX:
 *   useSearchParams() (called inside useClients) requires a <Suspense>
 *   boundary during Next.js static generation at build time. During local
 *   dev this isn't enforced, but Vercel's `next build` will crash without it.
 *   Solution: split into ClientsPageShellInner (the real component) and a
 *   thin ClientsPageShell wrapper that adds the <Suspense> boundary.
 *   The default export is the wrapper — all existing imports are unaffected.
 *
 * FILE LOCATION: src/components/clients/ClientsPageShell.jsx
 */

"use client";

import { Suspense, useState, useCallback } from "react";
import { Loader2, AlertCircle, Users, RefreshCw } from "lucide-react";
import { apiPath } from "@/utils/routes";
import { useClients } from "@/hooks/useClients";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ClientRowCard from "./ClientRowCard";
import ClientsFilterBar from "./ClientsFilterBar";
import ClientsPagination from "./ClientsPagination";
import AssignResearchDrawer from "./AssignResearchDrawer";
import apiClient from "@/lib/apiClient";

/* ─────────────────────────────────────────────────────────────────────
 * Fallback shown while Suspense resolves (e.g. during SSG / hydration)
 * ───────────────────────────────────────────────────────────────────── */
function ShellFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full py-16">
      <div className="w-5 h-5 border-2 border-[#B797FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Inner component — contains ALL the original logic unchanged.
 * Renamed from ClientsPageShell → ClientsPageShellInner so it is
 * no longer the default export. Nothing else changes inside.
 * ───────────────────────────────────────────────────────────────────── */
function ClientsPageShellInner() {
  const { role } = useCurrentUser();

  // ── Data hook ──
  const {
    clients,
    pagination,
    isLoading,
    isValidating,
    isSearchPending,
    error,
    searchInput,
    handleSearchChange,
    commitSearch,
    activeFilters,
    setFilter,
    removeFilter,
    clearFilters,
    setPage,
    sortBy,
    sortOrder,
    setSort,
    mutate,
  } = useClients();

  // ── Drawer state ──
  // Only ONE drawer can be open at a time. We track which one and
  // which client it's for.
  const [assignDrawer, setAssignDrawer] = useState({
    open: false,
    client: null,
  });

  // ── Action handlers ──
  // These are passed down to ClientRowCard → ClientCardActions.
  // Each one either opens a drawer, makes an API call, or navigates.

  const handleOpen = useCallback((client) => {
    // Navigate to client detail page
    // TODO: Replace with your actual client detail route
    window.location.href = `/clients/${client._id}`;
  }, []);

  const handleEdit = useCallback((client) => {
    // TODO: Open edit drawer/modal or navigate to edit page
    window.location.href = `/clients/${client._id}/edit`;
  }, []);

  const handleDelete = useCallback(
    async (client) => {
      // TODO: Replace with your preferred confirmation (SweetAlert2, etc.)
      const confirmed = window.confirm(
        `Delete "${client.companyName || client.clientName}"? This cannot be undone.`
      );
      if (!confirmed) return;

      try {
        await apiClient.delete(
          `${apiPath.prodPath}/api/clients/${client._id}`
        );
        mutate(); // Refresh the list
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete client.");
      }
    },
    [mutate]
  );

  const handleAddToResearch = useCallback(
    async (client) => {
      try {
        await apiClient.post(
          `${apiPath.prodPath}/api/clients/${client._id}/research/request`
        );
        mutate(); // Refresh to show new status
      } catch (err) {
        alert(err.response?.data?.message || "Failed to send for research.");
      }
    },
    [mutate]
  );

  const handleAssignResearch = useCallback((client) => {
    setAssignDrawer({ open: true, client });
  }, []);

  const handleOpenResearch = useCallback((client) => {
    // TODO: Open research drawer or navigate to research view
    // For now, navigate to the client detail page
    window.location.href = `/clients/${client._id}?tab=research`;
  }, []);

  const handlePauseResearch = useCallback(
    async (client) => {
      try {
        const isPaused = client.researchStatus === "Research Paused";
        if (!isPaused) {
          // Pausing — optionally prompt for reason
          const reason = window.prompt("Reason for pausing (optional):");
          await apiClient.post(
            `${apiPath.prodPath}/api/clients/${client._id}/research/pause`,
            { pauseReason: reason || "" }
          );
        } else {
          // Resuming
          await apiClient.post(
            `${apiPath.prodPath}/api/clients/${client._id}/research/pause`
          );
        }
        mutate();
      } catch (err) {
        alert(
          err.response?.data?.message || "Failed to pause/resume research."
        );
      }
    },
    [mutate]
  );

  const handleSubmitResearch = useCallback(
    async (client) => {
      try {
        await apiClient.post(
          `${apiPath.prodPath}/api/clients/${client._id}/research/submit`
        );
        mutate();
      } catch (err) {
        alert(
          err.response?.data?.message || "Failed to submit research."
        );
      }
    },
    [mutate]
  );

  const handleUnassignResearch = useCallback(
    async (client) => {
      const reason = window.prompt(
        "Reason for unassigning (optional):"
      );
      try {
        await apiClient.post(
          `${apiPath.prodPath}/api/clients/${client._id}/research/unassign`,
          { reason: reason || "" }
        );
        mutate();
      } catch (err) {
        alert(
          err.response?.data?.message || "Failed to unassign research."
        );
      }
    },
    [mutate]
  );

  // ── Title based on role ──
  const titles = {
    BGC: { main: "My", accent: "clients" },
    "Sales Rep": { main: "My", accent: "clients" },
    Manager: { main: "All", accent: "clients" },
    TaskTeam: { main: "Research", accent: "queue" },
  };
  const title = titles[role] || titles.BGC;

  return (
    <>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[rgba(127,86,217,0.25)]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#6F618F] mb-1">
            Clients
          </div>
          <h1 className="font-['Instrument_Serif'] text-3xl text-white">
            {title.main}{" "}
            <span className="italic text-[#B797FF]">{title.accent}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="bg-[rgba(25,21,38,0.55)] border border-[rgba(69,44,149,0.4)] rounded-[14px] px-3 py-1.5 flex items-center gap-2 text-[12px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] inline-block" />
            <span className="text-[#A99BD4]">
              {pagination.total} clients
              {isValidating && !isLoading && (
                <span className="text-[#6F618F]"> · syncing</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="px-8 pt-5 pb-5">
        <ClientsFilterBar
          searchInput={searchInput}
          handleSearchChange={handleSearchChange}
          commitSearch={commitSearch}
          activeFilters={activeFilters}
          setFilter={setFilter}
          removeFilter={removeFilter}
          clearFilters={clearFilters}
          isSearchPending={isSearchPending}
          total={pagination.total}
          mutate={mutate}
        />
      </div>

      {/* ── Content area ── */}
      <div className="px-8 pb-6">
        {/* Loading state — skeleton cards */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[82px] rounded-[14px] bg-[rgba(35,28,70,0.5)] border border-[rgba(69,44,149,0.2)] animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="w-10 h-10 text-[#F87171]" />
            <p className="text-[#FCA5A5] text-sm text-center max-w-md">
              {error.message || "Failed to load clients."}
            </p>
            <button
              onClick={() => mutate()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium bg-gradient-to-b from-[#9B74F0] to-[#6B42C8] text-white cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-12 h-12 text-[#6F618F]" />
            <p className="text-[#A99BD4] text-sm">
              {Object.keys(activeFilters).length > 0 || searchInput
                ? "No clients match your filters."
                : "No clients found."}
            </p>
            {(Object.keys(activeFilters).length > 0 || searchInput) && (
              <button
                onClick={clearFilters}
                className="text-[12px] text-[#B797FF] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Client list */}
        {!isLoading && !error && clients.length > 0 && (
          <div
            className="space-y-2.5"
            style={{
              opacity: isValidating && !isLoading ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {clients.map((client) => (
              <ClientRowCard
                key={client._id}
                client={client}
                onOpen={handleOpen}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddToResearch={handleAddToResearch}
                onAssignResearch={handleAssignResearch}
                onOpenResearch={handleOpenResearch}
                onPauseResearch={handlePauseResearch}
                onSubmitResearch={handleSubmitResearch}
                onUnassignResearch={handleUnassignResearch}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoading && !error && clients.length > 0 && (
        <div className="px-8 pb-8">
          <ClientsPagination
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ── Drawers ── */}
      <AssignResearchDrawer
        open={assignDrawer.open}
        onOpenChange={(open) =>
          setAssignDrawer((prev) => ({ ...prev, open }))
        }
        client={assignDrawer.client}
        onSuccess={() => mutate()}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Default export — thin Suspense wrapper.
 * This is what page.jsx imports. The <Suspense> boundary satisfies
 * Next.js's requirement that any component tree using useSearchParams()
 * is wrapped during static generation.
 * ───────────────────────────────────────────────────────────────────── */
export default function ClientsPageShell() {
  return (
    <Suspense fallback={<ShellFallback />}>
      <ClientsPageShellInner />
    </Suspense>
  );
}