"use client";

import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Swal from "sweetalert2";
import useSWR from "swr";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPath, prodPath } from "@/utils/routes";
import useAuthStore from "@/store/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ClientsFilterBar from "@/components/clients/ClientsFilterBar";

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

function ClientListSkeleton({ rows = 10 }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading clients</p>
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

function memberFromClient(client) {
  const rawName = client.clientName || "";
  return {
    email: client.email,
    name: rawName,
    clientRefId: client._id,
    company: client.companyName || "",
    firstName: rawName.split(" ")[0] || "",
    lastName: rawName.split(" ").slice(1).join(" ") || "",
  };
}

export default function NewContactListDrawer({ open, handleClose, refreshData }) {
  const { userId, isManager, isTaskTeam } = useCurrentUser();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [drawerPage, setDrawerPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [drawerFilters, setDrawerFilters] = useState({});
  const [selectedMap, setSelectedMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);
  const [selectAllProgress, setSelectAllProgress] = useState(0);
  const selectAllCancelRef = useRef(false);

  const deferredSearch = useDeferredValue(searchInput);
  const isSearchPending = searchInput !== deferredSearch;

  const endpoint = useMemo(() => {
    if (isManager) return "/clients/manager/all";
    if (isTaskTeam) return "/clients/research/assigned";
    return "/clients/assigned";
  }, [isManager, isTaskTeam]);

  const swrKey = useMemo(() => {
    if (!open) return null;
    return buildDrawerUrl(endpoint, {
      page: drawerPage,
      limit: 10,
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

  const lastSyncedSwrKeyRef = useRef(null);

  useEffect(() => {
    if (!open) {
      lastSyncedSwrKeyRef.current = null;
      return;
    }
    if (!isValidating && swrKey) {
      lastSyncedSwrKeyRef.current = swrKey;
    }
  }, [open, isValidating, swrKey]);

  const swrKeyAwaitingSync =
    open &&
    swrKey != null &&
    lastSyncedSwrKeyRef.current != null &&
    lastSyncedSwrKeyRef.current !== swrKey;

  const showClientsSkeleton =
    open &&
    ((isLoading && clients.length === 0) || (isValidating && swrKeyAwaitingSync));

  const resetBrowsingState = useCallback(() => {
    setDrawerPage(1);
    setSearchInput("");
    setDrawerFilters({});
  }, []);

  const onDialogClose = useCallback(() => {
    resetBrowsingState();
    handleClose();
  }, [handleClose, resetBrowsingState]);

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    setDrawerPage(1);
  }, []);

  const commitSearch = useCallback(() => {
    setDrawerPage(1);
  }, []);

  const setFilter = useCallback((key, value) => {
    setDrawerFilters((prev) => ({ ...prev, [key]: value }));
    setDrawerPage(1);
  }, []);

  const removeFilter = useCallback((key) => {
    setDrawerFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setDrawerPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setDrawerFilters({});
    setSearchInput("");
    setDrawerPage(1);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedMap({});
    setDrawerFilters({});
    setSearchInput("");
    setDrawerPage(1);
  }, []);

  const selectedMembers = useMemo(() => Object.values(selectedMap), [selectedMap]);

  const toggleClient = useCallback((client) => {
    const id = client?._id != null ? String(client._id) : "";
    if (!id || !client?.email) return;

    setSelectedMap((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: memberFromClient(client) };
    });
  }, []);

  const removeSelected = useCallback((clientRefId, email) => {
    const key = clientRefId != null ? String(clientRefId) : email;
    if (!key) return;
    setSelectedMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const mergeClientsIntoSelection = useCallback((rows) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      for (const client of rows) {
        if (!client?.email || client._id == null) continue;
        const id = String(client._id);
        next[id] = memberFromClient(client);
      }
      return next;
    });
  }, []);

  const fetchClientsPage = useCallback(
    async (page, limit) => {
      const url = buildDrawerUrl(endpoint, {
        page,
        limit,
        search: deferredSearch,
        sortBy: "clientName",
        sortOrder: "asc",
        ...drawerFilters,
      });
      return drawerFetcher(url);
    },
    [endpoint, deferredSearch, drawerFilters]
  );

  const handleSelectAllMatching = useCallback(async () => {
    if (totalCount <= 0 || selectingAll) return;

    if (totalCount > 500) {
      const result = await Swal.fire({
        title: "Select all clients?",
        text: `${totalCount} clients found. Selecting all may take a moment.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Continue",
        cancelButtonText: "Cancel",
      });
      if (!result.isConfirmed) return;
    }

    selectAllCancelRef.current = false;
    setSelectingAll(true);
    setSelectAllProgress(0);

    try {
      if (totalCount <= 500) {
        const payload = await fetchClientsPage(1, totalCount);
        const rows = payload?.clients || [];
        mergeClientsIntoSelection(rows);
        setSelectAllProgress(100);
      } else {
        const pageSize = 100;
        const pages = Math.ceil(totalCount / pageSize);
        for (let p = 1; p <= pages; p += 1) {
          if (selectAllCancelRef.current) break;
          const payload = await fetchClientsPage(p, pageSize);
          const rows = payload?.clients || [];
          mergeClientsIntoSelection(rows);
          setSelectAllProgress(Math.round((p / pages) * 100));
        }
      }
    } catch {
      Swal.fire("Error", "Could not select all matching clients.", "error");
    } finally {
      setSelectingAll(false);
      setSelectAllProgress(0);
    }
  }, [totalCount, selectingAll, fetchClientsPage, mergeClientsIntoSelection]);

  const cancelSelectAll = useCallback(() => {
    selectAllCancelRef.current = true;
    setSelectingAll(false);
    setSelectAllProgress(0);
  }, []);

  const handleSave = async () => {
    if (!userId) {
      Swal.fire("Error", "User not found in auth session", "error");
      return;
    }
    if (!name.trim()) {
      Swal.fire("Warning", "Please enter a list name", "warning");
      return;
    }
    if (selectedMembers.length === 0) {
      Swal.fire("Warning", "Please select at least one member", "warning");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${apiPath.prodPath3}/api/contact-lists/${userId}`, {
        name: name.trim(),
        description: description.trim(),
        members: selectedMembers,
      });

      Swal.fire("Saved", "Contact list created successfully", "success");
      setName("");
      setDescription("");
      resetBrowsingState();
      setSelectedMap({});
      if (typeof refreshData === "function") {
        refreshData();
      }
      handleClose();
    } catch {
      Swal.fire("Error", "Failed to create contact list", "error");
    } finally {
      setSaving(false);
    }
  };

  const goPage = (p) => {
    const next = Math.max(1, Math.min(totalPages, p));
    setDrawerPage(next);
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
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

  return (
    <Dialog
      open={open}
      onClose={onDialogClose}
      maxWidth={false}
      disableEnforceFocus
      PaperProps={{
        sx: {
          width: "90vw",
          maxWidth: "1200px",
          height: "90vh",
          borderRadius: "16px",
          backgroundColor: "transparent",
          overflow: "hidden",
          m: 0,
        },
      }}
    >
      <div className="p-10 flex flex-col bg-[#2D245B] flex-wrap text-white h-full overflow-y-auto min-h-0">
        <div className="flex flex-row items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-satoshi text-2xl font-bold text-[#E1C9FF] truncate">New Contact List</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={resetAll}
              className="text-sm text-[#E1C9FF] hover:text-white underline-offset-2 hover:underline"
            >
              Reset All
            </button>
            <CloseIcon className="text-2xl hover:cursor-pointer" onClick={onDialogClose} />
          </div>
        </div>

        {selectingAll && (
          <div className="mb-3 rounded-lg border border-[#452C95] bg-[#231C46] px-3 py-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 text-sm text-[#E1C9FF]">
              <span>Selecting all clients… {selectAllProgress}%</span>
              <button
                type="button"
                onClick={cancelSelectAll}
                className="text-xs text-[#FCA5A5] hover:underline"
              >
                Cancel
              </button>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#2D245B] overflow-hidden">
              <div
                className="h-full bg-[#B797FF] transition-[width] duration-150"
                style={{ width: `${selectAllProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#7F56D9]">
          <div className="flex flex-col gap-2">
            <label className="font-satoshi text-md">List Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 border-[#452C95] rounded-[8px] border bg-[#231C46]"
              placeholder="Warm Leads - April"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-satoshi text-md">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2 border-[#452C95] rounded-[8px] border bg-[#231C46]"
              placeholder="Optional description"
            />
          </div>
        </div>

        <div className="mt-4 mb-4 shrink-0">
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
        </div>

        {error && (
          <p className="text-sm text-[#FCA5A5] mb-2">Failed to load clients. Try refresh or adjust filters.</p>
        )}

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
          <div className="border border-[#452C95] bg-[#231C46] rounded-[12px] p-4 overflow-hidden flex flex-col min-h-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
              <h2 className="text-[#B797FF] font-semibold">
                Clients
                {totalPages > 0 && (
                  <span className="text-[#A99BD4] font-normal text-sm ml-2">
                    (page {drawerPage} of {totalPages})
                  </span>
                )}
              </h2>
              <button
                type="button"
                disabled={totalCount === 0 || selectingAll || isLoading}
                onClick={handleSelectAllMatching}
                className="text-xs px-2 py-1 rounded-md border border-[#7F56D9] text-[#E1C9FF] hover:bg-[#2D245B] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectingAll ? "Selecting…" : `Select all ${totalCount} matching`}
              </button>
            </div>

            <div className="overflow-auto flex-1 pr-2 min-h-0">
              {showClientsSkeleton ? (
                <ClientListSkeleton rows={10} />
              ) : clients.length === 0 ? (
                <p className="text-sm text-[#E1C9FF]">No clients found.</p>
              ) : (
                clients.map((client, rowIdx) => {
                  const key = client?._id != null ? String(client._id) : `row-${rowIdx}`;
                  const hasEmail = Boolean(client?.email?.trim());
                  const checked = Boolean(client?._id != null && selectedMap[String(client._id)]);
                  const muted = !hasEmail;
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-2 rounded-md ${
                        muted ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2D245B] cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!hasEmail}
                        onChange={() => toggleClient(client)}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {client.clientName || client.companyName || "Unnamed Client"}
                          {!hasEmail && (
                            <span className="text-[#6F618F] text-xs ml-1">(no email)</span>
                          )}
                        </p>
                        <p className="text-xs text-[#E1C9FF] truncate">{hasEmail ? client.email : "—"}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-[#452C95] shrink-0 flex-wrap">
                <button
                  type="button"
                  disabled={drawerPage <= 1 || showClientsSkeleton}
                  onClick={() => goPage(drawerPage - 1)}
                  className="px-2 py-1 text-sm rounded border border-[#452C95] text-[#E1C9FF] hover:bg-[#2D245B] disabled:opacity-30"
                >
                  ◂
                </button>
                {pageNumbers.map((item, idx) =>
                  item === "…" ? (
                    <span key={`e-${idx}`} className="text-[#6F618F] px-1">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      disabled={showClientsSkeleton}
                      onClick={() => goPage(item)}
                      className={`min-w-[2rem] px-2 py-1 text-sm rounded border ${
                        drawerPage === item
                          ? "border-[#B797FF] bg-[#2D245B] text-white"
                          : "border-[#452C95] text-[#E1C9FF] hover:bg-[#2D245B]"
                      } disabled:opacity-30`}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  type="button"
                  disabled={drawerPage >= totalPages || showClientsSkeleton}
                  onClick={() => goPage(drawerPage + 1)}
                  className="px-2 py-1 text-sm rounded border border-[#452C95] text-[#E1C9FF] hover:bg-[#2D245B] disabled:opacity-30"
                >
                  ▸
                </button>
              </div>
            )}
          </div>

          <div className="border border-[#452C95] bg-[#231C46] rounded-[12px] p-4 overflow-hidden flex flex-col min-h-0">
            <h2 className="text-[#B797FF] font-semibold mb-3 shrink-0">
              Selected ({selectedMembers.length})
            </h2>
            <div className="overflow-auto flex-1 pr-2 min-h-0">
              {selectedMembers.length === 0 ? (
                <p className="text-sm text-[#E1C9FF]">No members selected yet.</p>
              ) : (
                selectedMembers.map((member) => (
                  <div
                    key={`${member.clientRefId || member.email}`}
                    className="flex items-start justify-between gap-2 p-2 rounded-md bg-[#2D245B] border border-[#452C95] mb-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{member.name || "No Name"}</p>
                      <p className="text-xs text-[#E1C9FF] truncate">{member.email}</p>
                    </div>
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => removeSelected(member.clientRefId, member.email)}
                      className="shrink-0 p-1 rounded text-[#A99BD4] hover:text-[#FCA5A5] hover:bg-[#231C46]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[#7F56D9] shrink-0">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#B797FF] text-black hover:opacity-90"
          >
            {saving ? "Saving..." : "Save Contact List"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
