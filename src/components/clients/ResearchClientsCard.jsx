"use client";

/*
 * ResearchClientsCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dashboard card showing all clients currently in the research pipeline.
 * Visible to BGC, Manager/Admin, and TaskTeam — each scoped to their role.
 *
 * FILE LOCATION: src/components/clients/ResearchClientsCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import {
  FlaskConical, RefreshCw, AlertCircle, ChevronRight,
  Clock, Pause, CheckCircle2, AlertTriangle, Loader2,
  X, UserMinus,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import { useResearchClients, RESEARCH_STATUSES } from "@/hooks/useResearchClients";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AssignResearchDrawer from "@/components/clients/AssignResearchDrawer";
import apiClient from "@/lib/apiClient";
import { CLIENT_ROUTES } from "@/utils/routes";
import ClientDetails from "@/components/subcomponents/drawers/clientOpen";

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "Research Needed": {
    label: "Needed",
    bg:    "rgba(251,191,36,0.12)",
    border:"rgba(251,191,36,0.35)",
    color: "#FCD34D",
    Icon:  AlertTriangle,
  },
  "Auto Research Queued": {
    label: "AI Queued",
    bg:    "rgba(34,211,238,0.1)",
    border:"rgba(34,211,238,0.3)",
    color: "#22D3EE",
    Icon:  Clock,
  },
  "Auto Research Running": {
    label: "AI Running",
    bg:    "rgba(34,211,238,0.15)",
    border:"rgba(34,211,238,0.4)",
    color: "#22D3EE",
    Icon:  Loader2,
    pulse: true,
  },
  "Under Research": {
    label: "In Progress",
    bg:    "rgba(96,165,250,0.12)",
    border:"rgba(96,165,250,0.35)",
    color: "#93C5FD",
    Icon:  Clock,
    pulse: true,
  },
  "Research Paused": {
    label: "Paused",
    bg:    "rgba(251,146,60,0.12)",
    border:"rgba(251,146,60,0.35)",
    color: "#FDBA74",
    Icon:  Pause,
  },
  "Research Complete": {
    label: "Complete",
    bg:    "rgba(74,222,128,0.12)",
    border:"rgba(74,222,128,0.35)",
    color: "#4ADE80",
    Icon:  CheckCircle2,
  },
};

const PRIORITY_CONFIG = {
  Urgent: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", color: "#F87171" },
  High:   { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  color: "#FCD34D" },
  Medium: { bg: "rgba(127,86,217,0.15)",  border: "rgba(127,86,217,0.3)",  color: "#E1C9FF" },
  Low:    { bg: "rgba(111,97,143,0.2)",   border: "rgba(111,97,143,0.3)",  color: "#A99BD4" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  const { label, bg, border, color, Icon, pulse } = cfg;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 99,
      background: bg, border: `1px solid ${border}`,
      fontSize: 11, fontWeight: 500, color,
      whiteSpace: "nowrap",
    }}>
      {pulse
        ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: "pulse 1.5s infinite" }} />
        : <Icon size={10} />
      }
      {label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  if (!cfg || !priority?.trim()) return <span style={{ color: "#4A4468", fontSize: 11 }}>—</span>;
  const { bg, border, color } = cfg;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 99,
      background: bg, border: `1px solid ${border}`,
      fontSize: 11, fontWeight: 500, color,
    }}>
      {priority}
    </span>
  );
}

function NameCell({ client }) {
  const display = client.companyName?.trim() || client.clientName || "—";
  const sub     = client.industry?.trim() || client.needCategory?.categoryName?.trim() || "";
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 13, fontWeight: 500, color: "#F5F0FF",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {display}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#534AB7", marginTop: 1 }}>{sub}</div>
      )}
    </div>
  );
}

function UserCell({ userRef, fallback = "—" }) {
  const name   = userRef?.name?.trim() || fallback;
  const isNull = !userRef?.id;
  return (
    <span style={{ fontSize: 12, color: isNull ? "#4A4468" : "#A99BD4" }}>
      {name}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNASSIGN DRAWER
// ─────────────────────────────────────────────────────────────────────────────

/*
 * UnassignResearchDrawer
 * ──────────────────────
 * Slide-in confirmation drawer for managers to remove a TaskTeam member
 * from a client's research assignment.
 *
 * Mirrors the visual design of AssignResearchDrawer exactly.
 * Calls: POST /api/clients/:id/research/unassign  { reason? }
 */
function UnassignResearchDrawer({ open, onOpenChange, client, onSuccess }) {
  const [reason, setReason]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  // Reset form each time the drawer opens for a (possibly new) client
  const handleOpenChange = (next) => {
    if (!next) {
      setReason("");
      setError(null);
      setSubmitting(false);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post(CLIENT_ROUTES.unassignResearch(client._id), {
        reason: reason.trim() || "",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unassign research. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!client) return null;

  const researcher = client.assignedToForResearch?.name || "the assigned researcher";

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[rgba(10,6,24,0.75)] backdrop-blur-sm z-50" />
        <Dialog.Content
          className={cn(
            "fixed top-4 right-4 bottom-4 w-[540px] max-w-[92vw] z-50",
            "bg-gradient-to-b from-[#2D245B] to-[#1E1740]",
            "border border-[rgba(127,86,217,0.45)] rounded-[20px]",
            "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]",
            "flex flex-col overflow-hidden",
            "animate-in slide-in-from-right-8 duration-300"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(127,86,217,0.3)]">
            <div>
              <Dialog.Title className="font-['Instrument_Serif'] text-xl text-white">
                Unassign{" "}
                <span className="italic text-[#FDBA74]">research</span>
              </Dialog.Title>
              <Dialog.Description className="text-[11px] text-[#6F618F] mt-0.5">
                Remove the assigned researcher from this client
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)] text-[#E1C9FF] hover:bg-[rgba(127,86,217,0.2)] transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Client preview */}
            <div className="bg-[rgba(25,21,38,0.55)] border border-[rgba(69,44,149,0.4)] rounded-[14px] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center text-white text-[13px] font-semibold shrink-0">
                {(client.clientName || "?")[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-white font-medium text-[14px] truncate">
                  {client.companyName?.trim() || client.clientName}
                </div>
                <div className="text-[12px] text-[#A99BD4]">
                  {client.primaryContact || client.email || "No contact"}
                </div>
                <div className="text-[11px] text-[#6F618F] mt-0.5">
                  Current status:{" "}
                  <span className="text-[#FDBA74]">{client.researchStatus}</span>
                </div>
              </div>
            </div>

            {/* Researcher being unassigned */}
            <div className="bg-[rgba(251,146,60,0.07)] border border-[rgba(251,146,60,0.25)] rounded-[12px] px-4 py-3 flex items-center gap-3">
              <UserMinus className="w-4 h-4 text-[#FDBA74] shrink-0" />
              <div className="text-[13px]">
                <span className="text-[#A99BD4]">Removing </span>
                <span className="text-[#FDBA74] font-medium">{researcher}</span>
                <span className="text-[#A99BD4]"> from this research task.</span>
              </div>
            </div>

            {/* Optional reason */}
            <div>
              <label className="text-[11px] text-[#A99BD4] font-medium tracking-[0.04em] uppercase block mb-1.5">
                Reason <span className="text-[#4A4468] normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full bg-[rgba(20,15,43,0.7)] border border-[rgba(69,44,149,0.5)] rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-[#F5F0FF] placeholder:text-[#4A4468] outline-none focus:border-[#B797FF] focus:shadow-[0_0_0_3px_rgba(183,151,255,0.12)] transition-all resize-none"
                rows={3}
                placeholder="Reassigning to a different researcher, task completed early, client request…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-[10px] px-4 py-3 text-[13px] text-[#FCA5A5]">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[rgba(127,86,217,0.3)] flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13.5px] font-medium bg-[rgba(127,86,217,0.1)] text-[#E1C9FF] border border-[rgba(127,86,217,0.4)] hover:bg-[rgba(127,86,217,0.2)] transition-all cursor-pointer">
                Cancel
              </button>
            </Dialog.Close>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13.5px] font-medium bg-gradient-to-b from-[#C25A20] to-[#8C3A0E] text-white shadow-[0_6px_20px_-6px_rgba(194,90,32,0.6),0_1px_0_rgba(255,255,255,0.15)_inset] hover:brightness-110 hover:-translate-y-px transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <UserMinus className="w-4 h-4" />
              }
              {submitting ? "Unassigning…" : "Confirm unassign"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION BUTTON
// ─────────────────────────────────────────────────────────────────────────────

/*
 * ActionButton
 * ────────────
 * Routes clicks to the correct handler based on role + research status:
 *   - "Assign"     → onAssign      (Manager, status = Research Needed)
 *   - "Unassign"   → onUnassign    (Manager, status = Under Research | Paused)
 *   - "Take task"  → onAssignToMe  (TaskTeam, no researcher assigned yet)
 *   - everything else → onOpen
 */
function ActionButton({ client, role, onOpen, onAssign, onUnassign, onAssignToMe, isAssigningMe, currentUserId }) {
  const status       = client.researchStatus;
  const isManager    = role === "Manager" || role === "Admin" || role === "Administrator";
  const isUnassigned = !client.assignedToForResearch?.id;
  const isMyTask     = role === "TaskTeam" && client.assignedToForResearch?.id === currentUserId;

  let label      = "View";
  let actionType = "open";

  if (isManager) {
    if (status === "Research Needed") {
      label      = "Assign";
      actionType = "assign";
    } else if (status === "Under Research" || status === "Research Paused") {
      label      = "Unassign";
      actionType = "unassign";
    } else {
      label = "Review";
    }
  } else if (role === "TaskTeam") {
    if (isUnassigned) {
      label      = isAssigningMe ? "Assigning…" : "Take task";
      actionType = "assignToMe";
    } else if (isMyTask) {
      // Only show active labels for the task assigned to this specific user
      if (status === "Under Research")  label = "Continue";
      else if (status === "Research Paused") label = "Resume";
      else label = "View";
    } else {
      // Assigned to a different TaskTeam member — read-only
      label = "View";
    }
  } else {
    if (status === "Research Complete") label = "Export";
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (actionType === "assign")     { onAssign?.(client);     return; }
    if (actionType === "unassign")   { onUnassign?.(client);   return; }
    if (actionType === "assignToMe") { onAssignToMe?.(client); return; }
    onOpen?.(client);
  };

  const btnStyle = {
    assign: {
      border:     "1px solid rgba(183,151,255,0.45)",
      background: "rgba(127,86,217,0.18)",
      color:      "#B797FF",
    },
    unassign: {
      border:     "1px solid rgba(251,146,60,0.4)",
      background: "rgba(251,146,60,0.1)",
      color:      "#FDBA74",
    },
    assignToMe: {
      border:     "1px solid rgba(74,222,128,0.4)",
      background: "rgba(74,222,128,0.08)",
      color:      "#4ADE80",
    },
    open: {
      border:     "1px solid rgba(127,86,217,0.3)",
      background: "rgba(127,86,217,0.08)",
      color:      "#B797FF",
    },
  }[actionType];

  return (
    <button
      onClick={handleClick}
      disabled={isAssigningMe}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 10px", borderRadius: 7,
        fontSize: 11, fontWeight: 500,
        cursor: isAssigningMe ? "not-allowed" : "pointer",
        opacity: isAssigningMe ? 0.65 : 1,
        whiteSpace: "nowrap",
        transition: "all 0.15s",
        ...btnStyle,
      }}
    >
      {isAssigningMe ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <ChevronRight size={11} />}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ROW
// ─────────────────────────────────────────────────────────────────────────────

function ResearchRow({ client, role, onOpen, onAssign, onUnassign, onAssignToMe, assigningId, isLast, currentUserId }) {
  const isMyTask = role === "TaskTeam"
    && client.assignedToForResearch?.id
    && client.assignedToForResearch.id === currentUserId;

  return (
    <div
      onClick={() => onOpen?.(client)}
      style={{
        display: "grid",
        gridTemplateColumns: "1.8fr 130px 1fr 1fr 90px 90px",
        gap: 12,
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: isLast ? "none" : "1px solid rgba(127,86,217,0.08)",
        borderLeft: isMyTask ? "2px solid rgba(183,151,255,0.6)" : "2px solid transparent",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(127,86,217,0.06)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <NameCell client={client} />
        {isMyTask && (
          <span style={{
            flexShrink: 0,
            fontSize: 9, fontWeight: 600,
            padding: "2px 6px", borderRadius: 99,
            background: "rgba(183,151,255,0.15)",
            border: "1px solid rgba(183,151,255,0.35)",
            color: "#C4A8FF",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Mine
          </span>
        )}
      </div>
      <StatusBadge status={client.researchStatus} />
      <UserCell userRef={client.assignedTo} fallback="Unassigned" />
      <UserCell userRef={client.assignedToForResearch} fallback="Not assigned" />
      <PriorityBadge priority={client.researchPriority} />
      <ActionButton
        client={client}
        role={role}
        onOpen={onOpen}
        onAssign={onAssign}
        onUnassign={onUnassign}
        onAssignToMe={onAssignToMe}
        isAssigningMe={assigningId === client._id}
        currentUserId={currentUserId}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE HEADER
// ─────────────────────────────────────────────────────────────────────────────

function TableHeader() {
  const hdr = {
    fontSize: 10, fontWeight: 600,
    color: "#4A4468",
    textTransform: "uppercase", letterSpacing: "0.08em",
  };
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1.8fr 130px 1fr 1fr 90px 90px",
      gap: 12,
      padding: "8px 16px",
      borderBottom: "1px solid rgba(127,86,217,0.12)",
    }}>
      <span style={hdr}>Client</span>
      <span style={hdr}>Status</span>
      <span style={hdr}>BGC</span>
      <span style={hdr}>Researcher</span>
      <span style={hdr}>Priority</span>
      <span style={hdr}>Action</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS FILTER TABS
// ─────────────────────────────────────────────────────────────────────────────

// All possible filter tabs — shown to everyone so the full funnel is visible.
const STATUS_FILTERS = [
  { key: "all",                    label: "All" },
  { key: "Research Needed",        label: "Needed" },
  { key: "Auto Research Queued",   label: "AI Queued" },
  { key: "Auto Research Running",  label: "AI Running" },
  { key: "Under Research",         label: "In Progress" },
  { key: "Research Paused",        label: "Paused" },
  { key: "Research Complete",      label: "Complete" },
];

function StatusFilterBar({ active, onChange, counts, currentUserId, isTaskTeam }) {
  // For TaskTeam we also expose a "Mine" pseudo-filter that is handled
  // via a separate `mineOnly` prop in the parent rather than a status key.
  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 16px 0", flexWrap: "wrap" }}>
      {STATUS_FILTERS.map(({ key, label }) => {
        const count    = key === "all" ? counts.all : (counts[key] || 0);
        const isActive = active === key;
        // Hide zero-count tabs (except "All") to keep the bar tidy
        if (key !== "all" && count === 0) return null;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 99,
              border: isActive
                ? "1px solid rgba(183,151,255,0.5)"
                : "1px solid rgba(127,86,217,0.15)",
              background: isActive
                ? "rgba(127,86,217,0.18)"
                : "transparent",
              color: isActive ? "#E1C9FF" : "#4A4468",
              fontSize: 11, fontWeight: isActive ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {label}
            {count > 0 && (
              <span style={{
                background: isActive ? "rgba(183,151,255,0.25)" : "rgba(255,255,255,0.05)",
                color: isActive ? "#E1C9FF" : "#4A4468",
                borderRadius: 99, padding: "0 5px", fontSize: 10,
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ResearchClientsCard({ onOpenClient }) {
  const { role, id: currentUserId, username: currentUsername } = useCurrentUser();
  const isTaskTeam = role === "TaskTeam";

  const [statusFilter, setStatusFilter] = useState("all");
  const [mineOnly, setMineOnly]         = useState(false);

  // ── Assign drawer state ──────────────────────────────────────────────────
  const [assignDrawer, setAssignDrawer] = useState({ open: false, client: null });

  const handleAssign = useCallback((client) => {
    setAssignDrawer({ open: true, client });
  }, []);

  // ── Unassign drawer state ────────────────────────────────────────────────
  const [unassignDrawer, setUnassignDrawer] = useState({ open: false, client: null });

  const handleUnassign = useCallback((client) => {
    setUnassignDrawer({ open: true, client });
  }, []);

  // ── Client details modal ─────────────────────────────────────────────────
  const [detailsModal, setDetailsModal] = useState({ open: false, item: null });

  const handleOpenDetails = useCallback((client) => {
    setDetailsModal({ open: true, item: client });
  }, []);

  // ── Assign-to-self loading state ─────────────────────────────────────────
  const [assigningId, setAssigningId] = useState(null);

  // ── Data ─────────────────────────────────────────────────────────────────
  // TaskTeam members should see the full research pipeline (not just their own
  // assignments) so they have visibility into the whole funnel.
  // `viewAll: true` is forwarded as ?viewAll=true to the backend, which should
  // ignore role-scoping when this flag is present.
  const { clients, isLoading, isValidating, error, mutate } = useResearchClients({
    page: 1,
    limit: 50,
    ...(isTaskTeam && { viewAll: true }),
  });

  // ── Assign-to-self (TaskTeam quick-claim) ────────────────────────────────
  // TaskTeam member clicks "Take task" on an unassigned client — posts to the
  // same assign endpoint with their own username and a default Medium priority.
  const handleAssignToMe = useCallback(async (client) => {
    setAssigningId(client._id);
    try {
      await apiClient.post(CLIENT_ROUTES.assignResearch(client._id), {
        taskTeamUsername: currentUsername,
        priority: "Medium",
        note: "",
      });
      mutate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign research.");
    } finally {
      setAssigningId(null);
    }
  }, [currentUsername, mutate]);

  const counts = {
    all: clients.length,
    ...RESEARCH_STATUSES.reduce((acc, s) => {
      acc[s] = clients.filter((c) => c.researchStatus === s).length;
      return acc;
    }, {}),
  };

  // Apply status filter, then optionally narrow to the current user's assignments
  const visible = clients
    .filter((c) => statusFilter === "all" || c.researchStatus === statusFilter)
    .filter((c) => !mineOnly || c.assignedToForResearch?.id === currentUserId);

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      {/*
       * Width matches ClientsCardInner's DashboardCard with defaultWidth="half":
       *   w-full on mobile, lg:w-[calc(65%-10px)] on large screens.
       * The card uses inline styles so we apply the width via className here.
       */}
      <div
        className="w-full lg:w-[calc(65%-10px)]"
        style={{
          background: "rgba(28,22,52,0.85)",
          border: "1px solid rgba(127,86,217,0.22)",
          borderRadius: 18,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Card header ────────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(127,86,217,0.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(183,151,255,0.1)",
              border: "1px solid rgba(183,151,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FlaskConical size={15} style={{ color: "#B797FF" }} />
            </div>
            <div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6F618F", lineHeight: 1 }}>
                Research
              </p>
              <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 17, color: "#B797FF", lineHeight: 1.2 }}>
                pipeline
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(25,21,38,0.6)",
              border: "1px solid rgba(69,44,149,0.4)",
              borderRadius: 10, padding: "4px 10px",
              fontSize: 11, color: "#A99BD4",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#B797FF", display: "inline-block" }} />
              {isLoading ? "—" : counts.all} clients
              {isValidating && !isLoading && (
                <span style={{ color: "#6F618F" }}> · syncing</span>
              )}
            </div>

            <button
              onClick={() => mutate()}
              style={{
                width: 30, height: 30, borderRadius: 8,
                border: "1px solid rgba(127,86,217,0.3)",
                background: "rgba(127,86,217,0.08)",
                color: "#8B7CB3", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* ── Status filter bar ───────────────────────────────────────────── */}
        <StatusFilterBar
          active={statusFilter}
          onChange={setStatusFilter}
          counts={counts}
          isTaskTeam={isTaskTeam}
        />

        {/* ── "Mine only" toggle — TaskTeam only ──────────────────────────── */}
        {isTaskTeam && (
          <div style={{ padding: "8px 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setMineOnly((p) => !p)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 99, fontSize: 11,
                border: mineOnly
                  ? "1px solid rgba(183,151,255,0.5)"
                  : "1px solid rgba(127,86,217,0.15)",
                background: mineOnly
                  ? "rgba(127,86,217,0.18)"
                  : "transparent",
                color: mineOnly ? "#E1C9FF" : "#4A4468",
                fontWeight: mineOnly ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {/* Small dot indicator */}
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: mineOnly ? "#C4A8FF" : "#4A4468",
                flexShrink: 0,
              }} />
              My tasks only
            </button>
            {mineOnly && (
              <span style={{ fontSize: 11, color: "#534AB7" }}>
                {visible.length} assigned to you
              </span>
            )}
          </div>
        )}

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", marginTop: 10 }}>

          {/* Loading skeleton */}
          {isLoading && (
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  height: 44, borderRadius: 10,
                  background: "rgba(35,28,70,0.5)",
                  border: "1px solid rgba(69,44,149,0.2)",
                  animation: "pulse 1.5s infinite",
                  animationDelay: `${i * 100}ms`,
                }} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "16px", color: "#FCA5A5", fontSize: 13,
            }}>
              <AlertCircle size={14} />
              Failed to load research pipeline.
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && visible.length === 0 && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "32px 16px", gap: 8,
            }}>
              <FlaskConical size={28} style={{ color: "#4A4468" }} />
              <p style={{ fontSize: 13, color: "#4A4468" }}>
                {statusFilter === "all"
                  ? "No clients in the research pipeline"
                  : `No clients with status "${statusFilter}"`}
              </p>
              {statusFilter !== "all" && (
                <button
                  onClick={() => setStatusFilter("all")}
                  style={{ fontSize: 12, color: "#B797FF", background: "none", border: "none", cursor: "pointer" }}
                >
                  Show all
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && visible.length > 0 && (
            <>
              <TableHeader />
              <div style={{ overflowY: "auto", maxHeight: 380 }}>
                {visible.map((client, i) => (
                  <ResearchRow
                    key={client._id}
                    client={client}
                    role={role}
                    onOpen={handleOpenDetails}
                    onAssign={handleAssign}
                    onUnassign={handleUnassign}
                    onAssignToMe={handleAssignToMe}
                    assigningId={assigningId}
                    currentUserId={currentUserId}
                    isLast={i === visible.length - 1}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Legend ─────────────────────────────────────────────────────── */}
        {!isLoading && visible.length > 0 && (
          <div style={{
            display: "flex", gap: 12, padding: "10px 16px",
            borderTop: "1px solid rgba(127,86,217,0.1)",
            flexWrap: "wrap",
          }}>
            {Object.entries(STATUS_CONFIG).map(([status, { color, label }]) => {
              const count = counts[status] || 0;
              if (count === 0) return null;
              return (
                <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#4A4468" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                  {label}: <strong style={{ color }}>{count}</strong>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── AssignResearchDrawer — portalled outside the card ────────────── */}
      <AssignResearchDrawer
        open={assignDrawer.open}
        onOpenChange={(open) => setAssignDrawer((prev) => ({ ...prev, open }))}
        client={assignDrawer.client}
        onSuccess={() => mutate()}
      />

      {/* ── UnassignResearchDrawer — portalled outside the card ──────────── */}
      <UnassignResearchDrawer
        open={unassignDrawer.open}
        onOpenChange={(open) => setUnassignDrawer((prev) => ({ ...prev, open }))}
        client={unassignDrawer.client}
        onSuccess={() => mutate()}
      />

      {/* ── ClientDetails — read-only view, opens on any "View" action ───── */}
      {detailsModal.open && detailsModal.item && (
        <ClientDetails
          open={detailsModal.open}
          handleClose={() => setDetailsModal({ open: false, item: null })}
          item={detailsModal.item}
        />
      )}
    </>
  );
}