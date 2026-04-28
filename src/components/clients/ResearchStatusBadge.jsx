/*
 * ResearchStatusBadge
 * ───────────────────
 * A small presentational component that renders the correct badge
 * for each research status. No business logic — just visual mapping.
 *
 * WHY A SEPARATE COMPONENT:
 *   The badge appears in multiple places (client row card, drawers,
 *   detail views). Extracting it means the color/icon mapping is
 *   defined ONCE and reused everywhere.
 *
 * USAGE:
 *   <ResearchStatusBadge
 *     status="Under Research"
 *     researcherName="Jane Doe"
 *     priority="High"
 *   />
 *
 * FILE LOCATION: src/components/clients/ResearchStatusBadge.jsx
 */

"use client";

import { CheckCircle2, Clock, Pause, AlertCircle, XCircle, CircleDashed } from "lucide-react";
import { cn } from "@/lib/cn";

// Maps each research status to its visual representation.
// Adding a new status = adding one entry here. Nothing else changes.
const STATUS_CONFIG = {
  "No Research Done": {
    label: "No research done",
    icon: CircleDashed,
    classes: "bg-[rgba(111,97,143,0.2)] border-[rgba(111,97,143,0.4)] text-[#A99BD4]",
  },
  "Research Needed": {
    label: "Research needed",
    icon: AlertCircle,
    classes: "bg-[rgba(251,191,36,0.12)] border-[rgba(251,191,36,0.35)] text-[#FCD34D]",
  },
  "Under Research": {
    label: "Under research",
    icon: Clock,
    classes: "bg-[rgba(96,165,250,0.12)] border-[rgba(96,165,250,0.35)] text-[#93C5FD]",
    pulse: true,
  },
  "Research Paused": {
    label: "Research paused",
    icon: Pause,
    classes: "bg-[rgba(251,146,60,0.12)] border-[rgba(251,146,60,0.35)] text-[#FDBA74]",
  },
  "Research Complete": {
    label: "Research complete",
    icon: CheckCircle2,
    classes: "bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.35)] text-[#86EFAC]",
  },
  "Dead-lead": {
    label: "Dead lead",
    icon: XCircle,
    classes: "bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.35)] text-[#FCA5A5]",
  },
};

export default function ResearchStatusBadge({
  status,
  researcherName,
  priority,
  className,
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["No Research Done"];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Main status badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border",
            config.classes
          )}
        >
          {config.pulse ? (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          ) : (
            <Icon className="w-3 h-3" />
          )}
          {config.label}
        </span>

        {/* Priority badge — only shown when relevant */}
        {priority && priority.trim() && status !== "No Research Done" && status !== "Dead-lead" && (
          <PriorityChip priority={priority} />
        )}
      </div>

      {/* Researcher name — shown when someone is assigned */}
      {researcherName && (status === "Under Research" || status === "Research Paused") && (
        <div className="text-[11px] text-[#6F618F]">
          {status === "Research Paused" ? "Paused by: " : "Researching: "}
          <span className="text-[#93C5FD]">{researcherName}</span>
        </div>
      )}

      {/* Completion note */}
      {researcherName && status === "Research Complete" && (
        <div className="text-[11px] text-[#6F618F]">
          Completed by: <span className="text-[#86EFAC]">{researcherName}</span>
        </div>
      )}
    </div>
  );
}

/* ── Priority chip sub-component ───────────────────────────────────── */

const PRIORITY_STYLES = {
  Urgent: "bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.35)] text-[#FCA5A5]",
  High: "bg-[rgba(251,191,36,0.12)] border-[rgba(251,191,36,0.35)] text-[#FCD34D]",
  Medium: "bg-[rgba(127,86,217,0.15)] border-[rgba(127,86,217,0.35)] text-[#E1C9FF]",
  Low: "bg-[rgba(111,97,143,0.2)] border-[rgba(111,97,143,0.4)] text-[#A99BD4]",
};

function PriorityChip({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", style)}>
      {priority}
    </span>
  );
}