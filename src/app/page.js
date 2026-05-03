"use client";
import React, { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "@/components/ui/app-sidebar";
import useAuthStore from "@/store/store";
import Navbar from "@/components/ui/Navbar";
import {
  AlertCircle,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CLIENT_ROUTES } from "@/utils/routes";
import { useClients } from "@/hooks/useClients";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ClientRowCard from "../components/clients/ClientRowCard";
import ClientsFilterBar from "../components/clients/ClientsFilterBar";
import ClientsPagination from "../components/clients/ClientsPagination";
import AssignResearchDrawer from "../components/clients/AssignResearchDrawer";
import apiClient from "@/lib/apiClient";
import ClientDetails from "@/components/subcomponents/drawers/clientOpen";
import AddCLient from "@/components/subcomponents/drawers/addClient";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import ResearchDrawer from "@/components/clients/ResearchDrawer";
import ResearchClientsCard from "@/components/clients/ResearchClientsCard";


function DashboardCard({
  title,
  accent,
  count,
  countLabel = "total",
  icon,
  isSyncing = false,
  defaultExpanded = true,
  defaultWidth = "half",
  children,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const widthClass = {
    full:  "w-full",
    half:  "w-full lg:w-[calc(65%-10px)]",
    third: "w-full lg:w-[calc(33.333%-14px)]",
  }[defaultWidth] ?? "w-full lg:w-[calc(65%-10px)]";

  return (
    <div
      className={`
        ${widthClass}
        flex flex-col
        rounded-[18px]
        border border-[rgba(127,86,217,0.22)]
        bg-[rgba(28,22,52,0.85)]
        overflow-hidden
        transition-all duration-300 ease-in-out
      `}
      style={{
        maxHeight: expanded ? "2000px" : "64px",
        transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* ── Card header ── */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="
          w-full flex items-center justify-between
          px-5 py-4
          border-b border-[rgba(127,86,217,0.18)]
          hover:bg-[rgba(69,44,149,0.12)]
          transition-colors cursor-pointer
          shrink-0
        "
        style={{ minHeight: "64px" }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-[10px] bg-[rgba(183,151,255,0.1)] border border-[rgba(183,151,255,0.2)] flex items-center justify-center text-[#B797FF]">
              {icon}
            </div>
          )}
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#6F618F] leading-none mb-0.5">
              {title}
            </p>
            {accent && (
              <p className="font-['Instrument_Serif'] text-lg leading-tight text-[#B797FF]">
                {accent}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {count !== undefined && (
            <div className="bg-[rgba(25,21,38,0.6)] border border-[rgba(69,44,149,0.4)] rounded-[10px] px-2.5 py-1 flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] inline-block" />
              <span className="text-[#A99BD4]">
                {count} {countLabel}
                {isSyncing && (
                  <span className="text-[#6F618F]"> · syncing</span>
                )}
              </span>
            </div>
          )}
          <div className="text-[#6F618F]">
            {expanded
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </div>
        </div>
      </button>

      {/* ── Card body ── */}
      <div className="flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Fallback shown while Suspense resolves.
 * Matches the existing full-page loading style used in the auth check.
 * ───────────────────────────────────────────────────────────────────── */
function ClientsCardFallback() {
  return (
    <div className="space-y-2.5 px-5 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-[72px] rounded-[12px] bg-[rgba(35,28,70,0.5)] border border-[rgba(69,44,149,0.2)] animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * ClientsCardInner — extracted from Home so it can sit inside a
 * <Suspense> boundary. Contains everything that calls useClients()
 * (which internally calls useSearchParams()).
 *
 * Receives no props — reads auth/role state from its own hooks, exactly
 * as the original code did inside Home.
 * ───────────────────────────────────────────────────────────────────── */
function ClientsCardInner() {
  const router = useRouter();
  const { role } = useCurrentUser();
  const [empId, setEmpId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [item, setItem] = useState(null);
  const [empModal, setEmpModal] = useState(false);
  const [researchDrawer, setResearchDrawer] = useState({ open: false, client: null });

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
    mutate,
  } = useClients();

  const [assignDrawer, setAssignDrawer] = useState({ open: false, client: null });

  const editEmp = (data) => {
    axios
      .put(`${apiPath.prodPath}/api/clients/edit/${empId}`, data)
      .then(() => mutate())
      .catch((err) => console.error(err));
  };

  const handleOpenResearch = (client) => {
    setResearchDrawer({ open: true, client });
  };

  const handleEdit = useCallback((client) => {
    setEmpId(client._id);
    setEmpModal(true);
    setItem(client);
  }, []);

  const handleOpen = useCallback((client) => {
    setItem(client);
    setEmpId(client._id);
    setOpenModal(true);
  }, []);

  const handleDelete = useCallback(async (client) => {
    const confirmed = window.confirm(
      `Delete "${client.companyName || client.clientName}"? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await apiClient.delete(CLIENT_ROUTES.byId(client._id));
      mutate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete client.");
    }
  }, [mutate]);

  const handleAddToResearch = useCallback(async (client) => {
    try {
      await apiClient.post(CLIENT_ROUTES.requestResearch(client._id));
      mutate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send for research.");
    }
  }, [mutate]);

  const handleAssignResearch = useCallback((client) => {
    setAssignDrawer({ open: true, client });
  }, []);

  // const handleOpenResearch = useCallback((client) => {
  //   router.push(`/clients/${client._id}?tab=research`);
  // }, [router]);

  const handlePauseResearch = useCallback(async (client) => {
    try {
      const isPaused = client.researchStatus === "Research Paused";
      if (!isPaused) {
        const reason = window.prompt("Reason for pausing (optional):");
        await apiClient.post(CLIENT_ROUTES.pauseResearch(client._id), { pauseReason: reason || "" });
      } else {
        await apiClient.post(CLIENT_ROUTES.pauseResearch(client._id));
      }
      mutate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to pause/resume research.");
    }
  }, [mutate]);

  const handleSubmitResearch = useCallback(async (client) => {
    try {
      await apiClient.post(CLIENT_ROUTES.submitResearch(client._id));
      mutate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit research.");
    }
  }, [mutate]);

  const handleUnassignResearch = useCallback(async (client) => {
    const reason = window.prompt("Reason for unassigning (optional):");
    try {
      await apiClient.post(CLIENT_ROUTES.unassignResearch(client._id), { reason: reason || "" });
      mutate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unassign research.");
    }
  }, [mutate]);

  const titles = {
    BGC: { main: "My", accent: "clients" },
    "Sales Rep": { main: "My", accent: "clients" },
    Manager: { main: "All", accent: "clients" },
    TaskTeam: { main: "Research", accent: "queue" },
    Admin: { main: "All", accent: "clients" },
    "Business Growth Consultant": { main: "My", accent: "clients" },
  };
  const title = titles[role] || titles.BGC;

  return (
    <>
      <DashboardCard
        title={title.main}
        accent={title.accent}
        count={pagination.total}
        countLabel="clients"
        icon={<Users className="w-4 h-4" />}
        isSyncing={isValidating && !isLoading}
        defaultExpanded={true}
        defaultWidth="half"
      >
        {/* Filter bar */}
        <div className="px-5 pt-4 pb-3 border-b border-[rgba(127,86,217,0.12)]">
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

        {/* Client rows */}
        <div className="px-5 py-4">

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] rounded-[12px] bg-[rgba(35,28,70,0.5)] border border-[rgba(69,44,149,0.2)] animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <AlertCircle className="w-9 h-9 text-[#F87171]" />
              <p className="text-[#FCA5A5] text-sm text-center max-w-sm">
                {error.message || "Failed to load clients."}
              </p>
              <button
                onClick={() => mutate()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium bg-gradient-to-b from-[#9B74F0] to-[#6B42C8] text-white cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Users className="w-10 h-10 text-[#6F618F]" />
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

          {/* List */}
          {!isLoading && !error && clients.length > 0 && (
            <div
              className="space-y-2"
              style={{
                opacity: isValidating && !isLoading ? 0.6 : 1,
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

          {empModal && item && empId === item._id && (
            <AddCLient
              open={empModal}
              handleClose={() => setEmpModal(false)}
              edit={true}
              editData={item}
              editEmp={editEmp}
            />
          )}
          {openModal && item && empId === item._id && (
            <ClientDetails
              open={openModal}
              handleClose={() => setOpenModal(false)}
              item={item}
            />
          )}
          {researchDrawer.open && researchDrawer.client && (
            <ResearchDrawer
              open={researchDrawer.open}
              onOpenChange={(open) => setResearchDrawer((p) => ({ ...p, open }))}
              client={researchDrawer.client}
              onSuccess={() => mutate()}
            />)
              }
        </div>

        {/* Pagination */}
        {!isLoading && !error && clients.length > 0 && (
          <div className="px-5 pb-4 pt-1 border-t border-[rgba(127,86,217,0.12)]">
            <ClientsPagination
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>
        )}
      </DashboardCard>

      {/* Drawer — lives outside DashboardCard so it can overlay the full page */}
      <AssignResearchDrawer
        open={assignDrawer.open}
        onOpenChange={(open) => setAssignDrawer((prev) => ({ ...prev, open }))}
        client={assignDrawer.client}
        onSuccess={() => mutate()}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Home — default export. Auth gate lives here (no useSearchParams
 * dependency), so it does NOT need to be inside the Suspense boundary.
 * Only the clients card (ClientsCardInner) is wrapped.
 * ───────────────────────────────────────────────────────────────────── */
export default function Home() {
  const isUserLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated    = useAuthStore((state) => state.hasHydrated);
  const router         = useRouter();
  const user           = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isUserLoggedIn) router.push("/login");
  }, [isUserLoggedIn, hasHydrated, router]);

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center w-full h-dvh bg-[#191526]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#B797FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6F618F] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isUserLoggedIn || !user) return null;

  return (
    <div className="flex flex-row w-full h-dvh overflow-hidden bg-[#191526]">

      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] h-full">
        <SidebarProvider>
          <AppSideBar />
        </SidebarProvider>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">
          <div className="flex flex-row flex-wrap gap-5 items-start">

            {/* ── CARD 1: Clients list — wrapped in Suspense ── */}
            <Suspense fallback={<ClientsCardFallback />}>
              <ClientsCardInner />
              <ResearchClientsCard />
            </Suspense>

          </div>
        </div>
      </main>
    </div>
  );
}