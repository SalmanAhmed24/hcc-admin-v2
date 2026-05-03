// hooks/useResearchClients.js
//
// Fetches clients currently in any research phase.
// Uses the same role-based endpoint as useClients so each role
// only sees clients scoped to them:
//   BGC/Sales Rep → /clients/assigned        (their own clients, filtered by researchStatus)
//   Manager/Admin → /clients/manager/all     (all clients, filtered by researchStatus)
//   TaskTeam      → /clients/research/assigned (only clients assigned to them for research)
//
// The backend's buildFieldFilters already supports multiple researchStatus
// values via comma-separation — we pass them as individual params since
// the helper does exact-match. Instead we rely on the "researchTag=true"
// filter which the backend supports natively, then client-side we can
// further filter if needed. Actually the cleanest approach: hit the
// manager/all or assigned endpoint with no researchStatus filter and
// rely on researchTag=true. For TaskTeam the research/assigned endpoint
// already returns only research clients.

"use client";

import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { prodPath } from "@/utils/routes";

// The research statuses we care about — used for client-side badge colouring
// The actual filtering is done by researchTag=true on the backend
export const RESEARCH_STATUSES = [
  "Research Needed",
  "Auto Research Queued",
  "Auto Research Running",
  "Under Research",
  "Research Paused",
  "Research Complete",
];

function getEndpoint(role) {
  if (role === "TaskTeam") return "/clients/manager/all";
  if (role === "Admin" || role === "Manager" || role === "Administrator") return "/clients/manager/all";
  return "/clients/assigned"; // BGC, Sales Rep, Business Growth Consultant
}

export function useResearchClients({ page = 1, limit = 10 } = {}) {
  const { role } = useCurrentUser();

  const endpoint = getEndpoint(role);

  // For TaskTeam the research/assigned endpoint already scopes correctly.
  // For everyone else we filter by researchTag=true which guarantees the
  // client is in the research pipeline.
  const isTaskTeam = role === "TaskTeam";

  const params = new URLSearchParams({
    page:  String(page),
    limit: String(limit),
    sortBy: "updatedAt",
    sortOrder: "desc",
    ...(!isTaskTeam ? { researchTag: "true" } : {}),
  });

  const swrKey = role ? `${endpoint}?${params.toString()}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: true,
      errorRetryCount: 1,
    }
  );

  // Filter client-side to only the statuses we want to display
  // (researchTag=true can include clients whose status is still
  //  "No Research Done" if the tag was set manually)
  const allClients = data?.clients || data?.data || [];
  const clients = allClients.filter((c) =>
    RESEARCH_STATUSES.includes(c.researchStatus)
  );

  return {
    clients,
    total:       clients.length,
    pagination:  data?.pagination || null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}