/*
 * ClientsFilterBar
 * ────────────────
 * Multi-layer filter bar with search input + filter pills.
 *
 * ARCHITECTURE:
 *   This component is CONTROLLED — it doesn't own any state.
 *   All values come from the useClients hook (which reads from the URL).
 *   All changes flow BACK to the hook (which writes to the URL).
 *
 *   searchInput + handleSearchChange → controlled search input
 *   activeFilters → which pills are active
 *   setFilter / removeFilter → toggle pills
 *
 * SEARCH BEHAVIOR:
 *   The input updates on every keystroke (responsive typing).
 *   The actual API call is debounced via useDeferredValue in useClients.
 *   The user sees their typed text immediately; the list updates ~300ms later.
 *
 * FILTER PILLS:
 *   Each pill is a clickable chip that adds/removes a query param.
 *   Active pills show the current value and an × to remove.
 *   The "+ Add filter" pill opens a popover (using Radix Popover)
 *   with the available filter fields.
 *
 * FILE LOCATION: src/components/clients/ClientsFilterBar.jsx
 */

"use client";

import { Search, SlidersHorizontal, RefreshCw, X, Plus } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";
import { useState } from "react";

// Available filter options with their possible values.
// These map directly to the backend's ALLOWED_FILTER_FIELDS.
const FILTER_OPTIONS = [
  {
    key: "status",
    label: "Status",
    values: ["lead", "active", "inactive", "prospect", "Dead-lead"],
  },
  {
    key: "researchStatus",
    label: "Research",
    values: [
      "No Research Done",
      "Research Needed",
      "Under Research",
      "Research Paused",
      "Research Complete",
      "Dead-lead",
    ],
  },
  {
    key: "researchPriority",
    label: "Priority",
    values: ["Urgent", "High", "Medium", "Low"],
  },
  {
    key: "territory",
    label: "Territory",
    // These would ideally come from the API. Hardcoded for now.
    // TODO: Fetch distinct territory values from a /api/clients/filters endpoint
    values: [],
    freeText: true,
  },
  {
    key: "industry",
    label: "Industry",
    values: [],
    freeText: true,
  },
  {
    key: "leadInactive",
    label: "Inactive",
    values: ["true", "false"],
    valueLabels: { true: "Inactive only", false: "Active only" },
  },
];

export default function ClientsFilterBar({
  searchInput,
  handleSearchChange,
  commitSearch,
  activeFilters,
  setFilter,
  removeFilter,
  clearFilters,
  isSearchPending,
  total,
  mutate,
}) {
  return (
    <div className="bg-[rgba(25,21,38,0.55)] border border-[rgba(69,44,149,0.4)] rounded-[14px] p-4">
      {/* ── Search Row ── */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "flex-1 flex items-center gap-3 rounded-xl px-4 py-2.5",
            "bg-[rgba(20,15,43,0.7)] border border-[rgba(69,44,149,0.5)]",
            "focus-within:border-[#B797FF] focus-within:shadow-[0_0_0_3px_rgba(183,151,255,0.12)]",
            "transition-all"
          )}
        >
          <Search
            className={cn(
              "w-[17px] h-[17px] flex-shrink-0 transition-colors",
              isSearchPending ? "text-[#B797FF] animate-pulse" : "text-[#A99BD4]"
            )}
          />
          <input
            className="flex-1 bg-transparent outline-none text-[13.5px] text-[#F5F0FF] placeholder:text-[#6F618F]"
            placeholder="Search by company, name, email, phone…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitSearch()}
          />
          {searchInput && (
            <button
              className="text-[#6F618F] hover:text-[#E1C9FF] transition-colors"
              onClick={() => {
                handleSearchChange("");
                commitSearch();
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Refresh button */}
        <button
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            "bg-[rgba(127,86,217,0.08)] border border-[rgba(127,86,217,0.3)]",
            "text-[#E1C9FF] hover:bg-[rgba(127,86,217,0.2)] transition-all cursor-pointer"
          )}
          onClick={() => mutate()}
          title="Refresh"
        >
          <RefreshCw className="w-[15px] h-[15px]" />
        </button>
      </div>

      {/* ── Filter Pills Row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] uppercase tracking-[0.12em] text-[#6F618F] font-semibold">
          Filter:
        </span>

        {/* Active filter pills */}
        {Object.entries(activeFilters).map(([key, value]) => {
          const option = FILTER_OPTIONS.find((o) => o.key === key);
          const label = option?.label || key;
          const displayValue = option?.valueLabels?.[value] || value;

          return (
            <button
              key={key}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px]",
                "bg-[rgba(127,86,217,0.2)] border border-solid border-[#B797FF]",
                "text-white cursor-pointer transition-all hover:bg-[rgba(127,86,217,0.3)]"
              )}
              onClick={() => removeFilter(key)}
            >
              {label}: <b>{displayValue}</b>
              <X className="w-3 h-3 opacity-60" />
            </button>
          );
        })}

        {/* Inactive filter pills (quick-add) */}
        {FILTER_OPTIONS.filter(
          (opt) => !activeFilters[opt.key] && !opt.freeText && opt.values.length > 0
        ).map((opt) => (
          <FilterPillDropdown
            key={opt.key}
            option={opt}
            onSelect={(value) => setFilter(opt.key, value)}
          />
        ))}

        {/* Add filter pill (for free-text filters) */}
        <AddFilterPill
          options={FILTER_OPTIONS.filter((o) => !activeFilters[o.key] && o.freeText)}
          onAdd={(key, value) => setFilter(key, value)}
        />

        {/* Clear all */}
        {Object.keys(activeFilters).length > 0 && (
          <button
            className="text-[11px] text-[#6F618F] hover:text-[#FCA5A5] transition-colors ml-1 cursor-pointer"
            onClick={clearFilters}
          >
            Clear all
          </button>
        )}

        {/* Total count */}
        <div className="ml-auto text-[11px] text-[#6F618F]">
          {total !== undefined && `${total} clients`}
        </div>
      </div>
    </div>
  );
}

/* ── FilterPillDropdown — a pill that opens a dropdown of values ─── */

function FilterPillDropdown({ option, onSelect }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px]",
            "bg-[rgba(20,15,43,0.7)] border border-dashed border-[rgba(127,86,217,0.5)]",
            "text-[#A99BD4] cursor-pointer transition-all",
            "hover:border-solid hover:text-[#E1C9FF]"
          )}
        >
          {option.label}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          className={cn(
            "min-w-[180px] p-1.5 rounded-xl z-50",
            "bg-gradient-to-b from-[#2D245B] to-[#1E1740]",
            "border border-[rgba(127,86,217,0.5)]",
            "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)]",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          <div className="text-[10px] uppercase tracking-[0.12em] text-[#6F618F] px-2.5 py-1.5 font-semibold">
            {option.label}
          </div>
          {option.values.map((value) => (
            <button
              key={value}
              className="flex items-center w-full px-2.5 py-2 rounded-lg text-[12.5px] text-[#A99BD4] hover:bg-[rgba(127,86,217,0.2)] hover:text-white cursor-pointer transition-all text-left"
              onClick={() => onSelect(value)}
            >
              {option.valueLabels?.[value] || value}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/* ── AddFilterPill — for free-text filter fields ────────────────── */

function AddFilterPill({ options, onAdd }) {
  const [selectedKey, setSelectedKey] = useState(null);
  const [inputValue, setInputValue] = useState("");

  if (options.length === 0) return null;

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (!open) {
          setSelectedKey(null);
          setInputValue("");
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px]",
            "bg-[rgba(20,15,43,0.7)] border border-dashed border-[rgba(127,86,217,0.7)]",
            "text-[#A99BD4] cursor-pointer transition-all",
            "hover:border-solid hover:text-[#E1C9FF]"
          )}
        >
          <Plus className="w-3 h-3" />
          Add filter
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          className={cn(
            "min-w-[200px] p-2 rounded-xl z-50",
            "bg-gradient-to-b from-[#2D245B] to-[#1E1740]",
            "border border-[rgba(127,86,217,0.5)]",
            "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)]",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          {!selectedKey ? (
            // Step 1: Pick the filter field
            <>
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#6F618F] px-2 py-1 font-semibold">
                Filter by
              </div>
              {options.map((opt) => (
                <button
                  key={opt.key}
                  className="flex items-center w-full px-2.5 py-2 rounded-lg text-[12.5px] text-[#A99BD4] hover:bg-[rgba(127,86,217,0.2)] hover:text-white cursor-pointer transition-all text-left"
                  onClick={() => setSelectedKey(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </>
          ) : (
            // Step 2: Enter the value
            <>
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#6F618F] px-2 py-1 font-semibold">
                {options.find((o) => o.key === selectedKey)?.label}
              </div>
              <div className="px-1 py-1">
                <input
                  className="w-full bg-[rgba(20,15,43,0.7)] border border-[rgba(69,44,149,0.5)] rounded-lg px-3 py-2 text-[13px] text-[#F5F0FF] outline-none focus:border-[#B797FF]"
                  placeholder="Type a value…"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim()) {
                      onAdd(selectedKey, inputValue.trim());
                      setSelectedKey(null);
                      setInputValue("");
                    }
                  }}
                  autoFocus
                />
              </div>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}