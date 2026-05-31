"use client";

/**
 * BulkResearchFlow.jsx
 * 4-step stepper for sending personalized research emails to multiple clients.
 * Step 1: Select clients — ALL clients shown, no-email clients greyed out,
 *         multi-layer filter bar + server-side pagination (same as contact list drawer)
 * Step 2: Configure send (subject, service, template)
 * Step 3: Preview personalization (3 sample cards + variable health)
 * Step 4: Launch (confirmation + send)
 */

import React, {
  useState, useEffect, useCallback, useMemo, useRef,
  useDeferredValue, useLayoutEffect,
} from "react";
import axios from "axios";
import useSWR from "swr";
import { FixedSizeList } from "react-window";
import { X } from "lucide-react";
import { apiPath, prodPath } from "@/utils/routes";
import apiClient from "@/lib/apiClient";
import Swal from "sweetalert2";
import useAuthStore from "@/store/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ClientsFilterBar from "@/components/clients/ClientsFilterBar";
import { buildTemplateData, countVariableHealth } from "./researchEmailUtils";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: "Select clients" },
  { num: 2, label: "Configure send" },
  { num: 3, label: "Preview personalization" },
  { num: 4, label: "Launch" },
];

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const inputStyle = {
  background: "rgba(20,15,43,0.7)", border: "1px solid rgba(69,44,149,0.5)",
  borderRadius: 10, padding: "10px 13px", color: "#F5F0FF",
  fontSize: 13.5, outline: "none", width: "100%", transition: "border .15s",
  fontFamily: "inherit",
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "#A99BD4",
  textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 5, display: "block",
};

const cardStyle = {
  background: "rgba(20,15,43,0.5)",
  border: "1px solid rgba(127,86,217,0.2)",
  borderRadius: 14, padding: 16,
};

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316",
];

function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// SWR URL BUILDER + FETCHER  (matches contact list drawer pattern)
// ─────────────────────────────────────────────────────────────────────────────
function buildDrawerUrl(endpoint, params) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
}

async function drawerFetcher(url) {
  const token = useAuthStore.getState().user?.jwtToken;
  const res = await axios.get(`${prodPath}${url}`, {
    headers: { ...(token && { authorization: `Bearer ${token}` }) },
  });
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEPPER
// ─────────────────────────────────────────────────────────────────────────────
function Stepper({ currentStep, selectedCount }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
      {STEPS.map((step, i) => {
        const isDone = currentStep > step.num;
        const isActive = currentStep === step.num;
        return (
          <React.Fragment key={step.num}>
            {i > 0 && (
              <div style={{
                height: 1, width: 36,
                background: isDone ? "rgba(74,222,128,0.35)" : "rgba(127,86,217,0.3)",
              }} />
            )}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              opacity: !isDone && !isActive ? 0.5 : 1,
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: 999,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
                background: isDone ? "rgba(74,222,128,0.2)" : isActive ? "rgba(127,86,217,0.3)" : "rgba(127,86,217,0.1)",
                border: `1px solid ${isDone ? "rgba(74,222,128,0.4)" : isActive ? "rgba(127,86,217,0.5)" : "rgba(127,86,217,0.25)"}`,
                color: isDone ? "#86EFAC" : isActive ? "#B797FF" : "#6F618F",
              }}>
                {isDone ? "✓" : step.num}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: isDone ? "#86EFAC" : isActive ? "#fff" : "#6F618F",
              }}>
                {step.label}{isDone && step.num === 1 && selectedCount > 0 ? ` · ${selectedCount}` : ""}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function ClientListSkeleton({ rows = 8 }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={`sk-${i}`}
          className="flex items-center gap-3 p-2 rounded-md border border-[#452C95]/40 bg-[#2D245B]/40 animate-pulse"
          style={{ animationDelay: `${i * 45}ms` }}
        >
          <div className="h-4 w-4 shrink-0 rounded border border-[#452C95]/60 bg-[#231C46]" />
          <div className="min-w-0 flex-1 space-y-2 py-0.5">
            <div className="h-3.5 max-w-[72%] rounded bg-[#452C95]/55" />
            <div className="h-3 max-w-[48%] rounded bg-[#452C95]/35" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTED MEMBER ROW (virtualised via react-window)
// ─────────────────────────────────────────────────────────────────────────────
const SELECTED_ROW_HEIGHT = 60;

function SelectedRow({ index, style, data }) {
  const member = data.members[index];
  if (!member) return null;
  return (
    <div style={style} className="box-border pb-1.5">
      <div className="flex h-full min-h-0 items-center justify-between gap-2 rounded-lg border border-[#452C95] bg-[#2D245B] px-3 py-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div style={{
            width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
            background: getAvatarColor(member.clientName), color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>
            {getInitials(member.clientName)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] text-white truncate font-medium">{member.clientName || "Unnamed"}</p>
            <p className="text-[11px] text-[#6F618F] truncate">{member.email}</p>
          </div>
        </div>
        <button
          type="button"
          title="Remove"
          onClick={() => data.onRemove(member._id)}
          className="shrink-0 p-1 rounded text-[#A99BD4] hover:text-[#FCA5A5] hover:bg-[#231C46]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: SELECT CLIENTS  (rewritten — all clients, filter bar, pagination)
// ═══════════════════════════════════════════════════════════════════════════════
function StepSelectClients({
  open,
  selectedMapRef, selectionVersion, bumpSelection,
}) {
  const { isManager, isTaskTeam } = useCurrentUser();

  // ── local browsing state ──
  const [drawerPage, setDrawerPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [drawerFilters, setDrawerFilters] = useState({});
  const [selectingAll, setSelectingAll] = useState(false);
  const [selectAllProgress, setSelectAllProgress] = useState(0);
  const selectAllCancelRef = useRef(false);

  const deferredSearch = useDeferredValue(searchInput);
  const isSearchPending = searchInput !== deferredSearch;

  // role-based endpoint (same as contact list drawer)
  const endpoint = useMemo(() => {
    if (isManager) return "/clients/manager/all";
    if (isTaskTeam) return "/clients/research/assigned";
    return "/clients/assigned";
  }, [isManager, isTaskTeam]);

  // SWR key
  const swrKey = useMemo(() => {
    if (!open) return null;
    return buildDrawerUrl(endpoint, {
      page: drawerPage,
      limit: PAGE_SIZE,
      search: deferredSearch,
      sortBy: "clientName",
      sortOrder: "asc",
      ...drawerFilters,
    });
  }, [open, endpoint, drawerPage, deferredSearch, drawerFilters]);

  const { data, error, isLoading, isValidating, mutate } = useSWR(swrKey, drawerFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 1,
  });

  const clients = data?.clients || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalCount = data?.pagination?.total || 0;

  // skeleton detection (same logic as contact list drawer)
  const lastSyncedKeyRef = useRef(null);
  useEffect(() => {
    if (!open) { lastSyncedKeyRef.current = null; return; }
    if (!isValidating && swrKey) lastSyncedKeyRef.current = swrKey;
  }, [open, isValidating, swrKey]);

  const awaitingSync = open && swrKey != null && lastSyncedKeyRef.current != null && lastSyncedKeyRef.current !== swrKey;
  const showSkeleton = open && ((isLoading && clients.length === 0) || (isValidating && awaitingSync));

  // ── filter callbacks ──
  const handleSearchChange = useCallback((v) => { setSearchInput(v); setDrawerPage(1); }, []);
  const commitSearch = useCallback(() => setDrawerPage(1), []);
  const setFilter = useCallback((k, v) => { setDrawerFilters((p) => ({ ...p, [k]: v })); setDrawerPage(1); }, []);
  const removeFilter = useCallback((k) => { setDrawerFilters((p) => { const n = { ...p }; delete n[k]; return n; }); setDrawerPage(1); }, []);
  const clearFilters = useCallback(() => { setDrawerFilters({}); setSearchInput(""); setDrawerPage(1); }, []);

  // ── selection helpers ──
  const toggleClient = useCallback((client) => {
    const id = client?._id != null ? String(client._id) : "";
    if (!id || !client?.email?.trim()) return;
    const map = selectedMapRef.current;
    if (map[id]) { delete map[id]; } else { map[id] = client; }
    bumpSelection();
  }, [selectedMapRef, bumpSelection]);

  const removeSelected = useCallback((id) => {
    delete selectedMapRef.current[String(id)];
    bumpSelection();
  }, [selectedMapRef, bumpSelection]);

  // ── select all matching ──
  const fetchClientsPage = useCallback(async (page, limit) => {
    const url = buildDrawerUrl(endpoint, {
      page, limit, search: deferredSearch,
      sortBy: "clientName", sortOrder: "asc",
      ...drawerFilters,
    });
    return drawerFetcher(url);
  }, [endpoint, deferredSearch, drawerFilters]);

  const mergeIntoSelection = useCallback((rows) => {
    const map = selectedMapRef.current;
    for (const client of rows) {
      if (!client?.email?.trim() || client._id == null) continue;
      map[String(client._id)] = client;
    }
  }, [selectedMapRef]);

  const handleSelectAllMatching = useCallback(async () => {
    if (totalCount <= 0 || selectingAll) return;
    if (totalCount > 500) {
      const r = await Swal.fire({ title: "Select all clients?", text: `${totalCount} clients found. This may take a moment.`, icon: "warning", showCancelButton: true, confirmButtonText: "Continue" });
      if (!r.isConfirmed) return;
    }
    selectAllCancelRef.current = false;
    setSelectingAll(true);
    setSelectAllProgress(0);
    try {
      if (totalCount <= 500) {
        const payload = await fetchClientsPage(1, totalCount);
        mergeIntoSelection(payload?.clients || []);
        setSelectAllProgress(100);
      } else {
        const pages = Math.ceil(totalCount / 100);
        for (let p = 1; p <= pages; p++) {
          if (selectAllCancelRef.current) break;
          const payload = await fetchClientsPage(p, 100);
          mergeIntoSelection(payload?.clients || []);
          setSelectAllProgress(Math.round((p / pages) * 100));
        }
      }
    } catch { Swal.fire("Error", "Could not select all matching clients.", "error"); }
    finally { setSelectingAll(false); setSelectAllProgress(0); bumpSelection(); }
  }, [totalCount, selectingAll, fetchClientsPage, mergeIntoSelection, bumpSelection]);

  // ── selected members list (virtualised) ──
  const selectedMembers = useMemo(
    () => Object.values(selectedMapRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectionVersion]
  );

  const selectedListOuterRef = useRef(null);
  const [listDims, setListDims] = useState({ w: 400, h: 300 });
  useLayoutEffect(() => {
    if (!open) return;
    const el = selectedListOuterRef.current;
    if (!el) return;
    const update = () => setListDims({ w: Math.max(200, el.clientWidth), h: Math.max(120, el.clientHeight) });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, selectedMembers.length]);

  const selectedItemData = useMemo(
    () => ({ members: selectedMembers, onRemove: removeSelected }),
    [selectedMembers, removeSelected]
  );

  // ── pagination helpers ──
  const goPage = (p) => setDrawerPage(Math.max(1, Math.min(totalPages, p)));
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, drawerPage, drawerPage - 1, drawerPage + 1]);
    const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const out = [];
    let prev = 0;
    for (const n of sorted) {
      if (prev && n - prev > 1) out.push("…");
      out.push(n);
      prev = n;
    }
    return out;
  }, [totalPages, drawerPage]);

  // ── no-email count on current page ──
  const noEmailCount = clients.filter((c) => !c.email?.trim()).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      {/* Header */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>Pick clients to email</div>
        <div style={{ fontSize: 12, color: "#A99BD4", marginTop: 3 }}>
          All your clients are listed below. Clients <b style={{ color: "#FCA5A5" }}>without an email</b> cannot be selected.
        </div>
      </div>

      {/* Select-all progress bar */}
      {selectingAll && (
        <div style={{
          padding: "8px 14px", borderRadius: 10,
          background: "rgba(20,15,43,0.6)", border: "1px solid rgba(69,44,149,0.5)",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#E1C9FF" }}>
            <span>Selecting all clients… {selectAllProgress}%</span>
            <button onClick={() => { selectAllCancelRef.current = true; }} style={{ fontSize: 11, color: "#FCA5A5", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "#2D245B", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${selectAllProgress}%`, background: "#B797FF", transition: "width .15s" }} />
          </div>
        </div>
      )}

      {/* Filter bar */}
      <ClientsFilterBar
        searchInput={searchInput}
        handleSearchChange={handleSearchChange}
        commitSearch={commitSearch}
        activeFilters={drawerFilters}
        setFilter={setFilter}
        removeFilter={removeFilter}
        clearFilters={clearFilters}
        isSearchPending={isSearchPending}
        total={totalCount}
        mutate={mutate}
      />

      {error && (
        <p style={{ fontSize: 13, color: "#FCA5A5" }}>Failed to load clients. Try adjusting filters or refreshing.</p>
      )}

      {/* Two-column layout: client list | selected list */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* ── LEFT: Client list ── */}
        <div style={{
          border: "1px solid rgba(69,44,149,0.4)", background: "rgba(35,28,70,0.6)",
          borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#B797FF" }}>
              Clients
              {totalPages > 0 && (
                <span style={{ color: "#A99BD4", fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
                  (page {drawerPage} of {totalPages})
                </span>
              )}
            </div>
            <button
              disabled={totalCount === 0 || selectingAll || isLoading}
              onClick={handleSelectAllMatching}
              style={{
                padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: "pointer",
                background: "rgba(127,86,217,0.08)", border: "1px solid rgba(127,86,217,0.35)", color: "#E1C9FF",
                opacity: totalCount === 0 || selectingAll || isLoading ? 0.4 : 1,
              }}
            >
              {selectingAll ? "Selecting…" : `Select all ${totalCount} matching`}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingRight: 4 }}>
            {showSkeleton ? (
              <ClientListSkeleton rows={PAGE_SIZE} />
            ) : clients.length === 0 ? (
              <p style={{ fontSize: 13, color: "#6F618F", textAlign: "center", paddingTop: 24 }}>No clients found.</p>
            ) : (
              clients.map((client, idx) => {
                const key = client?._id != null ? String(client._id) : `row-${idx}`;
                const hasEmail = Boolean(client?.email?.trim());
                const checked = Boolean(client?._id != null && selectedMapRef.current[String(client._id)]);
                const researchStatus = client.researchStatus || "";
                const isComplete = researchStatus === "Research Complete";

                return (
                  <label
                    key={key}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 8,
                      cursor: hasEmail ? "pointer" : "not-allowed",
                      opacity: hasEmail ? 1 : 0.4,
                      background: checked ? "rgba(127,86,217,0.1)" : "transparent",
                      transition: "background .1s",
                      borderBottom: "1px solid rgba(69,44,149,0.15)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!hasEmail}
                      onChange={() => toggleClient(client)}
                      style={{ accentColor: "#7F56D9", cursor: hasEmail ? "pointer" : "not-allowed" }}
                    />
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      background: getAvatarColor(client.clientName), color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0,
                    }}>
                      {getInitials(client.clientName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {client.clientName || "Unnamed"}
                        </span>
                        {!hasEmail && (
                          <span style={{ fontSize: 10, color: "#FCA5A5", background: "rgba(248,113,113,0.1)", padding: "1px 6px", borderRadius: 4 }}>no email</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#6F618F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {hasEmail ? client.email : "—"}
                        {client.industry ? ` · ${client.industry}` : ""}
                      </div>
                    </div>
                    {/* Research status badge */}
                    <span style={{
                      flexShrink: 0, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 500,
                      background: isComplete ? "rgba(74,222,128,0.1)" : researchStatus ? "rgba(127,86,217,0.1)" : "rgba(127,86,217,0.05)",
                      color: isComplete ? "#86EFAC" : researchStatus ? "#A99BD4" : "#6F618F",
                      border: `1px solid ${isComplete ? "rgba(74,222,128,0.25)" : "rgba(127,86,217,0.15)"}`,
                      maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {isComplete && "✓ "}{researchStatus || "No research"}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(69,44,149,0.3)", flexShrink: 0, flexWrap: "wrap",
            }}>
              <button
                disabled={drawerPage <= 1 || showSkeleton}
                onClick={() => goPage(drawerPage - 1)}
                style={{
                  padding: "4px 8px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                  background: "transparent", border: "1px solid rgba(69,44,149,0.4)", color: "#E1C9FF",
                  opacity: drawerPage <= 1 || showSkeleton ? 0.3 : 1,
                }}
              >
                ◂
              </button>
              {pageNumbers.map((item, idx) =>
                item === "…" ? (
                  <span key={`e-${idx}`} style={{ color: "#6F618F", padding: "0 4px" }}>…</span>
                ) : (
                  <button
                    key={item}
                    disabled={showSkeleton}
                    onClick={() => goPage(item)}
                    style={{
                      minWidth: 28, padding: "4px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                      background: drawerPage === item ? "rgba(45,36,91,0.8)" : "transparent",
                      border: `1px solid ${drawerPage === item ? "#B797FF" : "rgba(69,44,149,0.4)"}`,
                      color: drawerPage === item ? "#fff" : "#E1C9FF",
                      opacity: showSkeleton ? 0.3 : 1,
                    }}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                disabled={drawerPage >= totalPages || showSkeleton}
                onClick={() => goPage(drawerPage + 1)}
                style={{
                  padding: "4px 8px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                  background: "transparent", border: "1px solid rgba(69,44,149,0.4)", color: "#E1C9FF",
                  opacity: drawerPage >= totalPages || showSkeleton ? 0.3 : 1,
                }}
              >
                ▸
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Selected clients ── */}
        <div style={{
          border: "1px solid rgba(69,44,149,0.4)", background: "rgba(35,28,70,0.6)",
          borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#B797FF" }}>
              Selected ({selectedMembers.length})
            </div>
            {selectedMembers.length > 0 && (
              <button
                onClick={() => { selectedMapRef.current = {}; bumpSelection(); }}
                style={{
                  padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: "pointer",
                  background: "rgba(127,86,217,0.08)", border: "1px solid rgba(127,86,217,0.35)", color: "#E1C9FF",
                }}
              >
                Clear all
              </button>
            )}
          </div>

          <div ref={selectedListOuterRef} style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            {selectedMembers.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#6F618F" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32" style={{ opacity: 0.3, marginBottom: 8 }}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                <p style={{ fontSize: 13 }}>No clients selected yet</p>
                <p style={{ fontSize: 11, marginTop: 4, maxWidth: 220, textAlign: "center", lineHeight: 1.5 }}>
                  Select clients from the list on the left. Each will receive a personalized email.
                </p>
              </div>
            ) : (
              <FixedSizeList
                height={listDims.h}
                itemCount={selectedMembers.length}
                itemSize={SELECTED_ROW_HEIGHT}
                width={listDims.w}
                itemData={selectedItemData}
              >
                {SelectedRow}
              </FixedSizeList>
            )}
          </div>
        </div>
      </div>

      {/* No-email notice */}
      {noEmailCount > 0 && (
        <div style={{
          padding: "8px 14px", borderRadius: 10,
          background: "rgba(252,211,77,0.06)", border: "1px solid rgba(252,211,77,0.2)",
          display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#FCD34D", flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span><b>{noEmailCount} client{noEmailCount !== 1 ? "s" : ""}</b> on this page {noEmailCount === 1 ? "has" : "have"} no email and cannot be selected.</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2: CONFIGURE SEND
// ═══════════════════════════════════════════════════════════════════════════════
function StepConfigure({ config, setConfig }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 4 }}>Configure send</div>
      <div style={{ fontSize: 12, color: "#A99BD4", marginBottom: 20 }}>Set subject, service, and template for this batch.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
        <div>
          <label style={labelStyle}>Subject</label>
          <input
            value={config.subject} onChange={(e) => setConfig((p) => ({ ...p, subject: e.target.value }))}
            placeholder="{{firstName}}, did you notice these urgent issues on the {{clientName}} website?"
            style={inputStyle}
          />
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#7F56D9" }}>
            {"{{clientName}}"} will be replaced with each client&apos;s name
          </p>
        </div>

        <div>
          <label style={labelStyle}>Service</label>
          <select value={config.service} onChange={(e) => setConfig((p) => ({ ...p, service: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="gmail">Gmail</option>
            <option value="sendgrid">SendGrid</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Template</label>
          <div style={{ ...inputStyle, color: "#B797FF", cursor: "default", display: "flex", alignItems: "center", gap: 8 }}>
            Website Audit — Digital Discovery
            <span style={{ marginLeft: "auto", fontSize: 10, color: "#4ADE80", background: "rgba(74,222,128,0.1)", padding: "2px 8px", borderRadius: 999 }}>Locked</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6F618F" }}>
            Template is locked to Website Audit for research campaigns. Each client&apos;s data will auto-fill.
          </p>
        </div>

        <div>
          <label style={labelStyle}>Body Override (optional)</label>
          <textarea
            value={config.bodyOverride} onChange={(e) => setConfig((p) => ({ ...p, bodyOverride: e.target.value }))}
            placeholder="Leave blank to use the SEO template with auto-filled data, or write a custom body…"
            rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            onClick={() => setConfig((p) => ({ ...p, logInteractions: !p.logInteractions }))}
            style={{
              width: 18, height: 18, borderRadius: 5, display: "inline-flex", alignItems: "center", justifyContent: "center",
              border: `1.5px solid ${config.logInteractions ? "#7F56D9" : "rgba(127,86,217,0.3)"}`,
              background: config.logInteractions ? "#7F56D9" : "transparent",
              color: "#fff", fontSize: 10, cursor: "pointer",
            }}
          >
            {config.logInteractions && "✓"}
          </span>
          <span style={{ fontSize: 12.5, color: "#A99BD4" }}>
            Log each send to client&apos;s <b style={{ color: "#fff" }}>Interactions</b> tab
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function StepPreview({ selectedClients, senderName, senderTitle, config, onShuffle, previews, loadingPreviews }) {
  return (
    <div>
      <div style={{ marginBottom: 14, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>Per-recipient preview</div>
          <div style={{ fontSize: 12, color: "#A99BD4", marginTop: 3 }}>
            Each card shows what that specific recipient will see — same template, different data.
          </div>
        </div>
        <button onClick={onShuffle} style={{
          padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
          background: "rgba(127,86,217,0.08)", border: "1px solid rgba(127,86,217,0.35)", color: "#E1C9FF",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          ↻ Shuffle samples
        </button>
      </div>

      {/* Preview cards */}
      {loadingPreviews ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6F618F" }}>Loading preview data…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(previews.length, 3)}, 1fr)`, gap: 14 }}>
          {previews.map((p, i) => {
            const health = countVariableHealth(p.templateData);
            const hasMissing = health.missing.length > 0;
            return (
              <div key={i} style={{
                ...cardStyle,
                borderColor: hasMissing ? "rgba(252,211,77,0.4)" : "rgba(127,86,217,0.2)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 0 10px", borderBottom: "1px solid rgba(127,86,217,0.1)" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
                    background: getAvatarColor(p.client.clientName), color: "#fff", fontSize: 10, fontWeight: 700,
                  }}>
                    {getInitials(p.client.clientName)}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>{p.client.clientName}</div>
                    <div style={{ fontSize: 10.5, color: "#6F618F" }}>{p.client.email || "No email"}</div>
                  </div>
                </div>
                {/* Variables */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#A99BD4" }}>
                  <div><b style={{ color: "#fff" }}>Subject:</b> &ldquo;{config.subject.replace(/\{\{\s*clientName\s*\}\}/g, p.templateData.clientName).replace(/\{\{\s*firstName\s*\}\}/g, p.templateData.firstName)}&rdquo;</div>
                  <div><span style={{ color: "#7F56D9", fontSize: 11, background: "rgba(127,86,217,0.1)", padding: "1px 6px", borderRadius: 4 }}>domain</span> → {p.templateData.clientDomain}</div>
                  <div><span style={{ color: "#7F56D9", fontSize: 11, background: "rgba(127,86,217,0.1)", padding: "1px 6px", borderRadius: 4 }}>overall</span> → {p.templateData.overallAuditGrade} ({p.templateData.overallAuditScore}/100)</div>
                  <div><span style={{ color: "#7F56D9", fontSize: 11, background: "rgba(127,86,217,0.1)", padding: "1px 6px", borderRadius: 4 }}>scores</span> → SEO:{p.templateData.onPageSeoGrade} GEO:{p.templateData.geoGrade} Links:{p.templateData.linksGrade} UX:{p.templateData.usabilityGrade} Perf:{p.templateData.performanceGrade}</div>
                  <div><span style={{ color: "#7F56D9", fontSize: 11, background: "rgba(127,86,217,0.1)", padding: "1px 6px", borderRadius: 4 }}>sender</span> → {p.templateData.senderName}</div>
                </div>
                {/* Footer */}
                <div style={{
                  marginTop: 10, padding: "8px 0 0", borderTop: "1px solid rgba(127,86,217,0.1)",
                  display: "flex", alignItems: "center", gap: 6, fontSize: 11,
                  color: hasMissing ? "#FCD34D" : "#86EFAC",
                }}>
                  {hasMissing ? "⚠" : "✓"} {health.filled.length} / {health.total} vars
                  {hasMissing && <span style={{ color: "#FCD34D" }}>· {health.missing.length} fallback</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Variable health summary */}
      <div style={{ marginTop: 18, padding: "14px 18px", ...cardStyle }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Variable health across all {selectedClients.length} recipients</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "All vars filled", value: selectedClients.length, color: "#86EFAC", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" },
            { label: "1+ missing · fallback", value: 0, color: "#FCD34D", bg: "rgba(252,211,77,0.08)", border: "rgba(252,211,77,0.25)" },
            { label: "Critical missing", value: 0, color: "#FCA5A5", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
            { label: "Recipients", value: selectedClients.length, color: "#B797FF", bg: "rgba(127,86,217,0.1)", border: "rgba(127,86,217,0.3)" },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: "10px 12px", background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 10.5, color: "#6F618F", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: LAUNCH
// ═══════════════════════════════════════════════════════════════════════════════
function StepLaunch({ selectedClients, config, sending }) {
  const estimatedMinutes = Math.ceil(selectedClients.length / 50) * 7;

  return (
    <div>
      <div style={{
        ...cardStyle, textAlign: "center", padding: 32,
        background: "rgba(127,86,217,0.06)",
      }}>
        <div style={{ marginBottom: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28" style={{ color: "#B797FF" }}>
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#fff" }}>
          {sending ? "Launching…" : "Ready to launch"}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "#A99BD4", maxWidth: 480, marginInline: "auto", lineHeight: 1.6 }}>
          {selectedClients.length} personalized research emails will be sent. Each recipient gets the Website Audit template populated with <i>their</i> data. Sends throttle at 50/min via {config.service === "sendgrid" ? "SendGrid" : "Gmail"} to avoid bouncing.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 24, maxWidth: 440, marginInline: "auto" }}>
          {[
            { v: selectedClients.length, l: "Recipients" },
            { v: "0", l: "Attachments" },
            { v: `~${estimatedMinutes} min`, l: "Send window" },
            { v: "100%", l: "Vars resolved" },
          ].map((s) => (
            <div key={s.l} style={{ padding: "10px 0" }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: "#B797FF", lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 10, color: "#6F618F", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 20, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: config.logInteractions ? "#7F56D9" : "transparent",
              border: `1.5px solid ${config.logInteractions ? "#7F56D9" : "rgba(127,86,217,0.3)"}`,
              color: "#fff", fontSize: 9,
            }}>{config.logInteractions && "✓"}</span>
            <span style={{ fontSize: 12.5, color: "#A99BD4" }}>
              Log each send to client&apos;s <b style={{ color: "#fff" }}>Interactions</b> tab
            </span>
          </div>
        </div>
      </div>

      {/* Estimated throttle */}
      <div style={{
        marginTop: 16, padding: "14px 18px", ...cardStyle,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ color: "#B797FF", flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Estimated send time: ~{estimatedMinutes} minutes</div>
          <div style={{ fontSize: 11.5, color: "#6F618F", marginTop: 2 }}>
            Throttled at 50 emails/min. Track progress in Mailing → Bulk Jobs after launch.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function BulkResearchFlow({ open, onClose }) {
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    subject: "{{firstName}}, did you notice these urgent issues on the {{clientName}} website?",
    service: "gmail",
    bodyOverride: "",
    logInteractions: true,
  });
  const [previews, setPreviews] = useState([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // ── ref-based selection (same pattern as contact list drawer) ──
  const selectedMapRef = useRef({});
  const [selectionVersion, setSelectionVersion] = useState(0);
  const bumpSelection = useCallback(() => setSelectionVersion((v) => v + 1), []);

  const userId = user?.user?._id;
  const hccEmail = user?.user?.hccEmail || "";
  const senderName = `${user?.user?.firstName || ""} ${user?.user?.secondName || ""}`.trim();
  const senderTitle = user?.user?.title || "Business Growth Consultant";

  const selectedClients = useMemo(
    () => Object.values(selectedMapRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectionVersion]
  );

  // ── Reset on open ──
  useEffect(() => {
    if (!open) return;
    setStep(1);
    selectedMapRef.current = {};
    bumpSelection();
    setPreviews([]);
    setConfig({
      subject: "{{firstName}}, did you notice these urgent issues on the {{clientName}} website?",
      service: "gmail",
      bodyOverride: "",
      logInteractions: true,
    });
  }, [open, bumpSelection]);

  // ── Fetch previews when entering step 3 ──
  useEffect(() => {
    if (step === 3 && previews.length === 0) {
      fetchPreviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function fetchPreviews() {
    setLoadingPreviews(true);
    try {
      const shuffled = [...selectedClients].sort(() => Math.random() - 0.5);
      const sample = shuffled.slice(0, 3);

      const results = await Promise.all(
        sample.map(async (client) => {
          try {
            const res = await apiClient.get(`${prodPath}/clients/${client._id}/research/report`);
            const report = res.data?.report || {};
            const td = buildTemplateData(client, report, senderName, senderTitle);
            return { client, report, templateData: td };
          } catch {
            const td = buildTemplateData(client, {}, senderName, senderTitle);
            return { client, report: {}, templateData: td };
          }
        })
      );
      setPreviews(results);
    } catch (err) {
      console.error("Preview fetch failed:", err);
    } finally {
      setLoadingPreviews(false);
    }
  }

  function handleShuffle() {
    setPreviews([]);
    fetchPreviews();
  }

  // ── Send test email ──
  async function handleSendTest() {
    const resolvedEmail = testEmail.trim() || hccEmail;
    if (!resolvedEmail) { Swal.fire("Warning", "No test email", "warning"); return; }
    if (!config.subject.trim()) { Swal.fire("Warning", "Subject is required", "warning"); return; }

    setSending(true);
    try {
      const templateRes = await apiClient.get(`${prodPath}/appGmail/template/website-audit`, { responseType: "text" });
      const templateHtml = templateRes.data;

      const testClient = selectedClients[0];
      let testReport = {};
      try {
        const rr = await apiClient.get(`${prodPath}/clients/${testClient._id}/research/report`);
        testReport = rr.data?.report || {};
      } catch {}

      const td = buildTemplateData(testClient, testReport, senderName, senderTitle);

      const formData = new FormData();
      formData.append("recipients", JSON.stringify([resolvedEmail]));
      formData.append("subject", `[TEST] ${config.subject}`);
      formData.append("body", config.bodyOverride || templateHtml);
      formData.append("service", config.service);
      formData.append("source", "research");
      formData.append("recipientsData", JSON.stringify([{ email: resolvedEmail, ...td }]));

      await axios.post(`${apiPath.prodPath3}/api/bulkEmail/sendBulkEmail/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({ icon: "success", text: `Test sent to ${resolvedEmail}`, timer: 2000, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Failed to send test", "error");
    } finally {
      setSending(false);
    }
  }

  // ── Launch campaign ──
  async function handleLaunch() {
    if (!userId) { Swal.fire("Error", "User not found", "error"); return; }
    if (selectedClients.length === 0) { Swal.fire("Warning", "No clients selected", "warning"); return; }

    setSending(true);
    try {
      // 1. Fetch template HTML
      const templateRes = await apiClient.get(`${prodPath}/appGmail/template/website-audit`, { responseType: "text" });
      const templateHtml = templateRes.data;

      // 2. Fetch research for all selected clients
      const reportResults = await Promise.all(
        selectedClients.map(async (client) => {
          try {
            const res = await apiClient.get(`${prodPath}/clients/${client._id}/research/report`);
            return { client, report: res.data?.report || {} };
          } catch {
            return { client, report: {} };
          }
        })
      );

      // 3. Build recipientsData
      const recipientEmails = [];
      const recipientsData = [];

      for (const { client, report } of reportResults) {
        if (!client.email) continue;
        recipientEmails.push(client.email);
        const td = buildTemplateData(client, report, senderName, senderTitle);
        recipientsData.push({ email: client.email, ...td });
      }

      if (recipientEmails.length === 0) {
        Swal.fire("Warning", "None of the selected clients have email addresses", "warning");
        setSending(false);
        return;
      }

      // 4. Send via bulk endpoint
      const formData = new FormData();
      formData.append("recipients", JSON.stringify(recipientEmails));
      formData.append("subject", config.subject);
      formData.append("body", config.bodyOverride || templateHtml);
      formData.append("service", config.service);
      formData.append("source", "research");
      formData.append("recipientsData", JSON.stringify(recipientsData));

      await axios.post(`${apiPath.prodPath3}/api/bulkEmail/sendBulkEmail/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 5. Log interactions if checked
      if (config.logInteractions) {
        await Promise.allSettled(
          reportResults.map(({ client }) =>
            client.email
              ? axios.patch(`${apiPath.prodPath}/api/clients/addClientInteractions/${client._id}`, {
                  interactionCategory: "Research Email Sent",
                  date: new Date().toISOString(),
                  interactionDescription: `Bulk research email sent to ${client.email} using Website Audit template. Subject: "${config.subject.replace("{{clientName}}", client.clientName)}". Campaign: ${recipientEmails.length} recipients.`,
                  createdBy: senderName,
                })
              : Promise.resolve()
          )
        );
      }

      Swal.fire({
        icon: "success",
        title: "Campaign Launched!",
        text: `${recipientEmails.length} personalized research emails queued. Track progress in Bulk Jobs.`,
        timer: 3000,
        showConfirmButton: false,
      });

      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Failed to launch campaign", "error");
    } finally {
      setSending(false);
    }
  }

  // ── Navigation ──
  function canNext() {
    if (step === 1) return selectedClients.length > 0;
    if (step === 2) return config.subject.trim().length > 0;
    if (step === 3) return true;
    return false;
  }

  return (
    <Dialog
      open={open}
      onClose={sending ? undefined : onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "96vw", maxWidth: "1200px", height: "92vh",
          borderRadius: "20px", backgroundColor: "transparent",
          overflow: "hidden", m: 0,
          boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)",
        },
      }}
    >
      <div style={{
        display: "flex", flexDirection: "column", height: "100%",
        background: "linear-gradient(160deg, #2D245B 0%, #1B1539 100%)",
        border: "1px solid rgba(127,86,217,0.35)",
        borderRadius: 20, fontFamily: "'General Sans', system-ui, sans-serif",
        color: "#F5F0FF",
      }}>
        {/* ═══ HEADER ═══ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 28px 14px",
          borderBottom: "1px solid rgba(127,86,217,0.2)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #7F56D9, #4A2CA0)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>
              📨
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>
                New Bulk Research Email
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#A99BD4" }}>
                Personalized · uses each client&apos;s own research data
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={sending} style={{
            width: 34, height: 34, borderRadius: 8,
            border: "1px solid rgba(127,86,217,0.35)",
            background: "rgba(127,86,217,0.08)", color: "#E1C9FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: sending ? "not-allowed" : "pointer",
          }}>
            <CloseIcon style={{ fontSize: 16 }} />
          </button>
        </div>

        {/* ═══ BODY ═══ */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Stepper currentStep={step} selectedCount={selectedClients.length} />

          {step === 1 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <StepSelectClients
                open={open}
                selectedMapRef={selectedMapRef}
                selectionVersion={selectionVersion}
                bumpSelection={bumpSelection}
              />
            </div>
          )}
          {step === 2 && <StepConfigure config={config} setConfig={setConfig} />}
          {step === 3 && (
            <StepPreview
              selectedClients={selectedClients}
              senderName={senderName} senderTitle={senderTitle}
              config={config} onShuffle={handleShuffle}
              previews={previews} loadingPreviews={loadingPreviews}
            />
          )}
          {step === 4 && <StepLaunch selectedClients={selectedClients} config={config} sending={sending} />}
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 28px",
          borderTop: "1px solid rgba(127,86,217,0.2)", flexShrink: 0,
          background: "rgba(20,15,43,0.4)",
        }}>
          <div style={{ fontSize: 12, color: "#6F618F" }}>
            {selectedClients.length > 0
              ? `${selectedClients.length} client${selectedClients.length !== 1 ? "s" : ""} selected`
              : "Select clients to continue"
            }
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)} disabled={sending} style={{
                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: "rgba(127,86,217,0.08)", border: "1px solid rgba(127,86,217,0.35)", color: "#E1C9FF",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                ← Back
              </button>
            )}

            {step === 3 && (
              <>
                <input
                  type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                  placeholder={hccEmail || "test@email.com"}
                  style={{
                    background: "rgba(20,15,43,0.7)", border: "1px solid rgba(69,44,149,0.5)",
                    borderRadius: 10, padding: "8px 12px", color: "#F5F0FF",
                    fontSize: 12.5, outline: "none", width: 180, fontFamily: "inherit",
                  }}
                />
                <button onClick={handleSendTest} disabled={sending} style={{
                  padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: sending ? "not-allowed" : "pointer",
                  background: "rgba(127,86,217,0.08)", border: "1px solid rgba(127,86,217,0.35)", color: "#E1C9FF",
                }}>
                  Send test to me
                </button>
              </>
            )}

            {!sending && step < 4 && (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} style={{
                padding: "9px 20px", borderRadius: 10, border: "none",
                background: canNext() ? "linear-gradient(180deg,#9B74F0,#6B42C8)" : "rgba(127,86,217,0.2)",
                color: canNext() ? "white" : "#6F618F", fontSize: 13, fontWeight: 600,
                cursor: canNext() ? "pointer" : "not-allowed",
                boxShadow: canNext() ? "0 6px 20px -6px rgba(127,86,217,0.7)" : "none",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {step === 3 ? "Next: Launch" : `Next: ${STEPS[step]?.label || ""}`} →
              </button>
            )}

            {step === 4 && (
              <button onClick={handleLaunch} disabled={sending} style={{
                padding: "11px 22px", borderRadius: 10, border: "none",
                background: sending ? "rgba(127,86,217,0.3)" : "linear-gradient(180deg,#9B74F0,#6B42C8)",
                color: "white", fontSize: 13, fontWeight: 600,
                cursor: sending ? "not-allowed" : "pointer",
                boxShadow: sending ? "none" : "0 6px 20px -6px rgba(127,86,217,0.7)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {sending ? "Launching…" : `🚀 Launch · send ${selectedClients.length} emails`}
              </button>
            )}

            {!sending && step < 4 && (
              <button onClick={() => { onClose(); }} style={{
                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: "rgba(127,86,217,0.08)", border: "1px solid rgba(127,86,217,0.35)", color: "#E1C9FF",
              }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
