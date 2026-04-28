/*
 * ClientCardActions
 * ─────────────────
 * Role-gated action buttons for each client row card.
 *
 * CHANGED vs original:
 *
 *   The ownership check for TaskTeam buttons was:
 *     const isMyResearch = client.assignedToForResearch === username;
 *
 *   This is broken after the model migration because:
 *     - client.assignedToForResearch is now { id: ObjectId, name: string }
 *     - username is a plain string
 *     - The comparison ALWAYS returns false
 *     - TaskTeam members see ZERO action buttons on any client
 *
 *   Fixed to:
 *     const isMyResearch = client.assignedToForResearch?.id === userId;
 *
 *   Where userId comes from useCurrentUser() — it is the _id of the
 *   logged-in user as stored in the auth Zustand store. Both sides of
 *   the comparison are now ObjectId strings. The check works correctly.
 *
 *   username is no longer destructured (it was only used for isMyResearch).
 *   userId is destructured instead.
 *
 * FILE LOCATION: src/components/clients/ClientCardActions.jsx
 */

"use client";

import {
  Search,
  UserPlus,
  Plus,
  Pause,
  Play,
  FileText,
  UserMinus,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ClientCardActions({
  client,
  onAddToResearch,
  onAssignResearch,
  onOpenResearch,
  onPauseResearch,
  onSubmitResearch,
  onUnassignResearch,
}) {
  const {
    canSendToResearch,
    canAssignResearch,
    canSubmitResearch,
    canPauseResearch,
    canUnassignResearch,
    canViewResearch,
    isBGC,
    isManager,
    isTaskTeam,
    // CHANGED: userId replaces username for the ownership check.
    // username was only used for isMyResearch; userId is the correct
    // comparand against the ObjectId stored in assignedToForResearch.id
    userId,
  } = useCurrentUser();

  const status = client.researchStatus || "No Research Done";

  // CHANGED: ownership check
  //
  // OLD: client.assignedToForResearch === username
  //      LHS is { id: "64abc...", name: "Jane Doe" } — an object
  //      RHS is "jane_doe" — a string
  //      Result: ALWAYS false → TaskTeam sees no buttons on any client
  //
  // NEW: client.assignedToForResearch?.id === userId
  //      LHS is "64abc..." (ObjectId string from the UserRef subdoc)
  //      RHS is "64abc..." (ObjectId string from the JWT / auth store)
  //      Result: true only for the assigned TaskTeam member — correct
  const isMyResearch = client.assignedToForResearch?.id === userId;

  return (
    <div className="flex items-center gap-1.5 justify-end">

      {/* ── No Research Done ── */}
      {status === "No Research Done" && (
        <>
          {canSendToResearch && (
            <ActionBtn variant="primary" onClick={() => onAddToResearch(client)}>
              <Plus className="w-3 h-3" />
              Add to research
            </ActionBtn>
          )}
          {canAssignResearch && !isBGC && (
            <ActionBtn onClick={() => onAssignResearch(client)}>
              <UserPlus className="w-3 h-3" />
              Assign research
            </ActionBtn>
          )}
        </>
      )}

      {/* ── Research Needed (in queue) ── */}
      {status === "Research Needed" && (
        <>
          {isBGC && (
            <span className="text-[11px] text-[#6F618F] italic">In research queue</span>
          )}
          {canAssignResearch && (
            <ActionBtn variant="primary" onClick={() => onAssignResearch(client)}>
              <UserPlus className="w-3 h-3" />
              Assign research
            </ActionBtn>
          )}
        </>
      )}

      {/* ── Under Research ── */}
      {status === "Under Research" && (
        <>
          {isBGC && (
            <ActionBtn onClick={() => onOpenResearch(client)}>
              <Search className="w-3 h-3" />
              Open research
            </ActionBtn>
          )}
          {canUnassignResearch && (
            <ActionBtn onClick={() => onUnassignResearch(client)}>
              <UserMinus className="w-3 h-3" />
              Unassign
            </ActionBtn>
          )}
          {/* CHANGED: isMyResearch now uses ObjectId comparison */}
          {isTaskTeam && isMyResearch && (
            <>
              <ActionBtn onClick={() => onPauseResearch(client)}>
                <Pause className="w-3 h-3" />
                Pause
              </ActionBtn>
              <ActionBtn variant="primary" onClick={() => onOpenResearch(client)}>
                <FileText className="w-3 h-3" />
                Continue
              </ActionBtn>
            </>
          )}
        </>
      )}

      {/* ── Research Paused ── */}
      {status === "Research Paused" && (
        <>
          {isBGC && (
            <ActionBtn onClick={() => onOpenResearch(client)}>
              <Search className="w-3 h-3" />
              Open research
            </ActionBtn>
          )}
          {canUnassignResearch && (
            <ActionBtn onClick={() => onUnassignResearch(client)}>
              <UserMinus className="w-3 h-3" />
              Unassign
            </ActionBtn>
          )}
          {/* CHANGED: isMyResearch now uses ObjectId comparison */}
          {isTaskTeam && isMyResearch && (
            <ActionBtn variant="primary" onClick={() => onPauseResearch(client)}>
              <Play className="w-3 h-3" />
              Resume
            </ActionBtn>
          )}
        </>
      )}

      {/* ── Research Complete ── */}
      {status === "Research Complete" && (
        <>
          {canViewResearch && (
            <ActionBtn onClick={() => onOpenResearch(client)}>
              <Search className="w-3 h-3" />
              {isTaskTeam ? "View research" : "Open research"}
            </ActionBtn>
          )}
        </>
      )}

      {/* ── Dead-lead: no actions ── */}
    </div>
  );
}

/* ── Reusable action button ─────────────────────────────────────────── */

function ActionBtn({ children, variant = "ghost", onClick }) {
  const base =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border whitespace-nowrap";

  const styles = {
    ghost:
      "bg-[rgba(127,86,217,0.1)] text-[#E1C9FF] border-[rgba(127,86,217,0.35)] hover:bg-[rgba(127,86,217,0.22)]",
    primary:
      "bg-gradient-to-b from-[#9B74F0] to-[#6B42C8] text-white border-transparent shadow-[0_4px_12px_-3px_rgba(127,86,217,0.6)]",
  };

  return (
    <button className={`${base} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}