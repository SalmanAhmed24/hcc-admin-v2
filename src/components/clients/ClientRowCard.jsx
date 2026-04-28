/*
 * ClientRowCard
 * ─────────────
 * The main visual unit of the dashboard — one horizontal card per client.
 *
 * CHANGED vs original:
 *
 *   The researcherName extraction was:
 *     const researcherName =
 *       client.researchAssignment?.assignedTo &&
 *       client.researchAssignment.assignedTo !== "Not Assigned"
 *         ? client.researchAssignment.assignedTo
 *         : null;
 *
 *   This is broken after the model migration because:
 *     1. client.researchAssignment.assignedTo is now { id, name } — an object.
 *        Passing it as `researcherName` to ResearchStatusBadge would render
 *        "[object Object]" in the UI.
 *     2. The "Not Assigned" sentinel string no longer exists. Unassigned
 *        records now have { id: null, name: null }. The string comparison
 *        would never match anyway.
 *
 *   Fixed to:
 *     const researcherName = client.researchAssignment?.assignedTo?.id
 *       ? client.researchAssignment.assignedTo.name
 *       : null;
 *
 *   Logic:
 *     - If assignedTo.id is a non-null ObjectId string → someone is assigned
 *       → use .name (the denormalized display snapshot) as the display string
 *     - If assignedTo.id is null → nobody is assigned → pass null to the badge
 *       → the badge renders nothing (correct behaviour)
 *
 * No other changes in this file.
 *
 * FILE LOCATION: src/components/clients/ClientRowCard.jsx
 */

"use client";

import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";
import ResearchStatusBadge from "./ResearchStatusBadge";
import ClientCardActions from "./ClientCardActions";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* ── Avatar color generator ────────────────────────────────────────── */

const AVATAR_GRADIENTS = [
  "from-amber-500 to-amber-700",
  "from-blue-400 to-blue-700",
  "from-emerald-400 to-emerald-700",
  "from-pink-400 to-pink-700",
  "from-purple-400 to-purple-700",
  "from-rose-400 to-rose-700",
  "from-teal-400 to-teal-700",
  "from-orange-400 to-orange-700",
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return "??";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/* ── Status badge styles ───────────────────────────────────────────── */

const STATUS_STYLES = {
  active:      "bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.35)] text-[#86EFAC]",
  lead:        "bg-[rgba(127,86,217,0.15)] border-[rgba(127,86,217,0.35)] text-[#E1C9FF]",
  prospect:    "bg-[rgba(251,191,36,0.12)] border-[rgba(251,191,36,0.35)] text-[#FCD34D]",
  inactive:    "bg-[rgba(111,97,143,0.2)] border-[rgba(111,97,143,0.4)] text-[#A99BD4]",
  "Dead-lead": "bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.35)] text-[#FCA5A5]",
};

function getStatusStyle(status) {
  return STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.lead;
}

/* ── The Component ──────────────────────────────────────────────────── */

export default function ClientRowCard({
  client,
  onOpen,
  onEdit,
  onDelete,
  onAddToResearch,
  onAssignResearch,
  onOpenResearch,
  onPauseResearch,
  onSubmitResearch,
  onUnassignResearch,
}) {
  const { canEditClient, canDeleteClient } = useCurrentUser();

  const displayName = client.companyName?.trim() || client.clientName || "Unnamed";
  const initials    = getInitials(displayName);
  const gradient    = AVATAR_GRADIENTS[hashString(displayName) % AVATAR_GRADIENTS.length];
  const isDead      = client.researchStatus === "Dead-lead" || client.status === "Dead-lead";

  // Build the meta line: industry · territory
  const metaParts = [
    client.industry?.trim(),
    client.territory?.trim(),
  ].filter((v) => v && v !== " " && v !== "Not Selected");
  const metaLine = metaParts.join(" · ");

  // Primary contact display
  const contactName  = client.primaryContactRef?.name  || client.primaryContact || "";
  const contactEmail = client.primaryContactRef?.email || client.email          || "";

  // CHANGED: researcherName extraction
  //
  // OLD:
  //   client.researchAssignment?.assignedTo &&
  //   client.researchAssignment.assignedTo !== "Not Assigned"
  //     ? client.researchAssignment.assignedTo   ← passed the whole object
  //     : null
  //
  //   Problems:
  //   1. assignedTo is now { id, name } — passing it to ResearchStatusBadge
  //      would render "[object Object]" in the researcher name line.
  //   2. "Not Assigned" sentinel no longer exists — unassigned records have
  //      { id: null, name: null }, so the !== check always passed.
  //
  // NEW:
  //   Check assignedTo.id (the ObjectId) to determine if someone is assigned.
  //   If assigned, use assignedTo.name (the denormalized display snapshot).
  //   If not assigned (id is null), pass null → badge renders nothing.
  const researcherName = client.researchAssignment?.assignedTo?.id
    ? client.researchAssignment.assignedTo.name
    : null;

  return (
    <div
      className={cn(
        "grid items-center gap-3 px-5 py-3.5",
        "bg-[rgba(35,28,70,0.5)] border border-[rgba(69,44,149,0.35)] rounded-[14px]",
        "transition-all duration-200 cursor-pointer",
        "hover:bg-[rgba(56,44,110,0.6)] hover:border-[rgba(127,86,217,0.5)]",
        "hover:-translate-y-px hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]",
        isDead && "opacity-50"
      )}
      style={{ gridTemplateColumns: "44px 1.3fr 1fr 1fr 44px" }}
      onClick={() => onOpen?.(client)}
    >
      {/* ── Zone 1: Avatar ── */}
      <div
        className={cn(
          "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center",
          "text-white text-[13px] font-semibold flex-shrink-0",
          gradient
        )}
      >
        {initials}
      </div>

      {/* ── Zone 2: Identity ── */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-white text-[14px] truncate">
            {displayName}
          </span>
          <span
            className={cn(
              "inline-flex items-center px-2 py-px rounded-full text-[10px] font-medium border",
              getStatusStyle(client.status)
            )}
          >
            {client.status || "Lead"}
          </span>
        </div>
        {contactName && (
          <div className="text-[12px] text-[#A99BD4] truncate">
            {contactName}
            {contactEmail && (
              <span className="text-[#6F618F]"> · {contactEmail}</span>
            )}
          </div>
        )}
        {metaLine && (
          <div className="text-[11px] text-[#6F618F] mt-0.5 truncate">{metaLine}</div>
        )}
      </div>

      {/* ── Zone 3: Research Status ── */}
      {/* researcherName is now a plain string (or null) — safe to pass as prop */}
      <ResearchStatusBadge
        status={client.researchStatus || "No Research Done"}
        researcherName={researcherName}
        priority={client.researchPriority}
      />

      {/* ── Zone 4: Role-gated Actions ── */}
      <div onClick={(e) => e.stopPropagation()}>
        <ClientCardActions
          client={client}
          onAddToResearch={onAddToResearch}
          onAssignResearch={onAssignResearch}
          onOpenResearch={onOpenResearch}
          onPauseResearch={onPauseResearch}
          onSubmitResearch={onSubmitResearch}
          onUnassignResearch={onUnassignResearch}
        />
      </div>

      {/* ── Zone 5: Three-dot Menu ── */}
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)]",
                "text-[#E1C9FF] hover:bg-[rgba(127,86,217,0.2)]",
                "transition-all cursor-pointer outline-none"
              )}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className={cn(
                "min-w-[160px] p-1.5 rounded-xl z-50",
                "bg-gradient-to-b from-[#2D245B] to-[#1E1740]",
                "border border-[rgba(127,86,217,0.5)]",
                "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)]",
                "animate-in fade-in-0 zoom-in-95 duration-150"
              )}
            >
              <DropdownMenu.Item
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#A99BD4] hover:bg-[rgba(127,86,217,0.2)] hover:text-white cursor-pointer outline-none"
                onSelect={() => onOpen?.(client)}
              >
                <Eye className="w-3.5 h-3.5" />
                Open
              </DropdownMenu.Item>

              {canEditClient && (
                <DropdownMenu.Item
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#A99BD4] hover:bg-[rgba(127,86,217,0.2)] hover:text-white cursor-pointer outline-none"
                  onSelect={() => onEdit?.(client)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </DropdownMenu.Item>
              )}

              {canDeleteClient && (
                <>
                  <DropdownMenu.Separator className="h-px my-1 bg-[rgba(127,86,217,0.25)]" />
                  <DropdownMenu.Item
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#FCA5A5] hover:bg-[rgba(248,113,113,0.15)] cursor-pointer outline-none"
                    onSelect={() => onDelete?.(client)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}