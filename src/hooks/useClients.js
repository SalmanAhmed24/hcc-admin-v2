/*
 * useClients — SWR hook for the clients list
 * ────────────────────────────────────────────
 * This hook manages EVERYTHING the clients list needs:
 *   - Data fetching via SWR (with caching + revalidation)
 *   - Pagination state
 *   - Filter state
 *   - Search state (debounced via React 19's useDeferredValue)
 *   - URL sync (filters persist in the URL as query params)
 *
 * WHY SWR INSTEAD OF useEffect + axios:
 *   Your existing ClientActivityTimeline uses useEffect + axios + useState.
 *   That pattern has problems at scale:
 *     - No caching: every mount refetches
 *     - No revalidation on window focus
 *     - No deduplication: two components fetching the same data = two requests
 *     - Manual loading/error state management
 *   SWR solves all of these with zero config.
 *
 * HOW SWR WORKS (the mental model):
 *   const { data, error, isLoading } = useSWR(key, fetcher);
 *
 *   - `key` is a string (usually a URL). When the key changes, SWR refetches.
 *   - `fetcher` is a function that takes the key and returns data.
 *   - SWR caches the result under the key. Same key = same cache entry.
 *   - When the component remounts, SWR returns cached data IMMEDIATELY
 *     (no loading flash) and revalidates in the background.
 *   - When the user returns to the browser tab, SWR revalidates.
 *
 *   For our use case, the key is the full API URL with query params:
 *     "/api/clients/assigned?page=2&status=lead&search=acme"
 *
 *   When the user changes a filter, the key changes, SWR fetches the
 *   new URL, and the list updates. Old cache is preserved — if the user
 *   removes the filter, SWR returns the cached unfiltered data instantly.
 *
 * URL STATE (filters in the URL):
 *   Filters are stored as URL search params using Next.js useSearchParams.
 *   This gives us:
 *     - Shareable filtered views (copy the URL, send to a colleague)
 *     - Bookmarkable filters
 *     - Browser back/forward navigates through filter history
 *     - Page refresh preserves filters
 *
 *   The URL is the source of truth. The hook READS from the URL and
 *   WRITES to the URL when filters change. SWR reads the URL to build
 *   its key. Everything flows from the URL.
 *
 * DEBOUNCED SEARCH:
 *   React 19's useDeferredValue replaces lodash.debounce for this use case.
 *   It tells React "this value can lag behind the actual input."
 *   The input updates immediately (responsive typing), but the SWR key
 *   only changes when React has idle time — natural debouncing without
 *   a timer.
 *
 * FILE LOCATION: src/hooks/useClients.js
 */

"use client";

import { useState, useDeferredValue, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* ─────────────────────────────────────────────────────────────────────
 * Helper: build the API URL from current state
 * ─────────────────────────────────────────────────────────────────────
 * Takes all the filter/sort/pagination state and constructs the URL
 * that the backend expects. This URL becomes the SWR cache key.
 *
 * The endpoint changes based on role:
 *   BGC/Sales Rep → /api/clients/assigned
 *   Manager       → /api/clients/manager/all
 *   TaskTeam      → /api/clients/research/assigned
 * ───────────────────────────────────────────────────────────────────── */

function getEndpointForRole(role) {
  switch (role) {
    case "Admin":
      return "/clients/manager/all";
    case "TaskTeam":
      return "/clients/research/assigned";
    case "Business Growth Consultant":
      return "/clients/assigned";
    case "Business Growth Consultant":
      return "/clients/assigned";
    default:
      return "/clients/assigned";
  }
}

function buildApiUrl(endpoint, params) {
  const searchParams = new URLSearchParams();

  // Only add non-empty params to keep the URL clean
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, value);
    }
  }

  const qs = searchParams.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
}

/* ─────────────────────────────────────────────────────────────────────
 * The filter fields we support
 * ───────────────────────────────────────────────────────────────────── */

const FILTER_KEYS = [
  "status",
  "leadStatus",
  "researchStatus",
  "industry",
  "territory",
  "researchPriority",
  "researchTag",
  "leadInactive",
];

/* ─────────────────────────────────────────────────────────────────────
 * useClients hook
 * ───────────────────────────────────────────────────────────────────── */

export function useClients() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role, username } = useCurrentUser();

  // ── Read current state from URL ──
  // URL is the source of truth. We READ from it, never store duplicate state.
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const searchFromUrl = searchParams.get("search") || "";

  // ── Search input state (local, not in URL until deferred) ──
  // The actual input value updates instantly for responsive typing.
  // The deferred value lags behind — this is what triggers the API call.
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const deferredSearch = useDeferredValue(searchInput);

  // Whether the search is still "catching up" to what the user typed
  const isSearchPending = searchInput !== deferredSearch;

  // ── Read filters from URL ──
  const activeFilters = useMemo(() => {
    const filters = {};
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value && value !== "all") {
        filters[key] = value;
      }
    }
    return filters;
  }, [searchParams]);

  // ── Build the SWR key (API URL) ──
  // This is recalculated whenever any dependency changes.
  // When it changes, SWR automatically fetches the new URL.
  const endpoint = getEndpointForRole(role);
  const swrKey = useMemo(() => {
    return buildApiUrl(endpoint, {
      page,
      limit,
      sortBy,
      sortOrder,
      search: deferredSearch,
      ...activeFilters,
    });
  }, [endpoint, page, limit, sortBy, sortOrder, deferredSearch, activeFilters]);

  // ── SWR fetch ──
  const {
    data,
    error,
    isLoading,      // true on first load (no cache)
    isValidating,   // true when refetching (cache exists but stale)
    mutate,         // force refetch
  } = useSWR(swrKey, fetcher, {
    // Keep previous data while fetching new data (no flash)
    keepPreviousData: true,
    // Revalidate when user returns to the tab
    revalidateOnFocus: true,
    // Don't revalidate on reconnect (prevents unexpected refreshes)
    revalidateOnReconnect: false,
    // Retry once on error, then stop
    errorRetryCount: 1,
  });

  // ── URL update helper ──
  // Updates the URL search params without a full page navigation.
  // This is how filters, pagination, and sort changes are persisted.
  const updateUrl = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset to page 1 when filters change (not when page changes)
      if (!("page" in updates)) {
        params.set("page", "1");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // ── Public API ──
  // These are the functions and values components consume.

  // Change page
  const setPage = useCallback(
    (newPage) => updateUrl({ page: String(newPage) }),
    [updateUrl]
  );

  // Change sort
  const setSort = useCallback(
    (field, order = "desc") => updateUrl({ sortBy: field, sortOrder: order }),
    [updateUrl]
  );

  // Set a filter
  const setFilter = useCallback(
    (key, value) => updateUrl({ [key]: value }),
    [updateUrl]
  );

  // Remove a filter
  const removeFilter = useCallback(
    (key) => updateUrl({ [key]: null }),
    [updateUrl]
  );

  // Clear ALL filters (reset to clean state)
  const clearFilters = useCallback(() => {
    const clears = {};
    for (const key of FILTER_KEYS) {
      clears[key] = null;
    }
    clears.search = null;
    setSearchInput("");
    updateUrl(clears);
  }, [updateUrl]);

  // Handle search input change (updates local state immediately)
  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
  }, []);

  // Commit search to URL (called on blur or Enter, or let deferred handle it)
  const commitSearch = useCallback(() => {
    updateUrl({ search: searchInput || null });
  }, [searchInput, updateUrl]);

  return {
    // ── Data ──
    clients: data?.clients || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false },

    // ── Loading states ──
    isLoading,              // first load, no cache
    isValidating,           // background refetch
    isSearchPending,        // search input ahead of deferred value
    error,

    // ── Search ──
    searchInput,            // current input value (for controlled input)
    handleSearchChange,     // update input value
    commitSearch,           // push search to URL

    // ── Filters ──
    activeFilters,          // { status: "lead", researchStatus: "Under Research" }
    setFilter,              // setFilter("status", "lead")
    removeFilter,           // removeFilter("status")
    clearFilters,           // reset everything

    // ── Pagination ──
    setPage,                // setPage(3)

    // ── Sort ──
    sortBy,
    sortOrder,
    setSort,                // setSort("clientName", "asc")

    // ── Mutations ──
    mutate,                 // force refetch after a mutation (e.g., after editing a client)

    // ── Meta ──
    endpoint,               // which API endpoint is being hit (for debugging)
  };
}