/*
 * useCurrentUser — Auth state + role-based permissions
 * ─────────────────────────────────────────────────────
 * Reads from the Zustand auth store and exposes semantic permission
 * booleans so components never need to check role strings directly.
 *
 * CHANGED vs original:
 *   Added `userId` to the return value.
 *
 *   Why: ClientCardActions needs to compare the current user's identity
 *   against client.assignedToForResearch.id (an ObjectId string from
 *   MongoDB). The old ownership check used `username` (a string) against
 *   the old string field — that comparison is now wrong because the field
 *   is an object. The fix is to compare ObjectIds:
 *
 *     OLD: client.assignedToForResearch === username
 *          ↑ always false now — LHS is { id, name }, RHS is a string
 *
 *     NEW: client.assignedToForResearch?.id === userId
 *          ↑ both sides are ObjectId strings — correct comparison
 *
 *   `username` is kept in the return value for display purposes and
 *   for any other non-query code that still needs it.
 *
 * FILE LOCATION: src/hooks/useCurrentUser.js
 */

"use client";

import useAuthStore from "@/store/store";

export function useCurrentUser() {
  const user = useAuthStore((state) => state.user);

  const role     = user?.user?.role     || "";
  const username = user?.user?.username || "";

  // CHANGED: expose _id as userId for ownership comparisons.
  // The backend stores assignedToForResearch as { id: ObjectId, name: string }.
  // Components compare against the .id field, so we need the ObjectId string
  // here — not username, not display name.
  const userId = user?.user?._id || null;

  const isBGC      = role === "Business Growth Consultant" || role === "Sales Rep" || role === "BGC";
  const isManager  = role === "Manager" || role === "Admin" || role === "Administrator";
  const isTaskTeam = role === "TaskTeam";

  return {
    // ── Raw user data ──
    user,
    role,
    username,

    // CHANGED: added userId — use this for any comparison against
    // model fields that store ObjectId references (assignedTo.id,
    // assignedToForResearch.id, etc.)
    userId,

    isAuthenticated: !!user,

    // ── Role flags ──
    isBGC,
    isManager,
    isTaskTeam,

    // ── Research workflow permissions ──
    canSendToResearch:  isBGC || isManager,
    canAssignResearch:  isManager,
    canSubmitResearch:  isTaskTeam,
    canPauseResearch:   isTaskTeam,
    canUnassignResearch: isManager,
    canViewResearch:    isBGC || isManager || isTaskTeam,

    // ── CRUD permissions ──
    canEditClient:   isBGC || isManager,
    canDeleteClient: isManager,
    canLinkContacts: isBGC || isManager || isTaskTeam,
  };
}