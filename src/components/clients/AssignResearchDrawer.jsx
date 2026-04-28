/*
 * AssignResearchDrawer
 * ────────────────────
 * Slide-in drawer for managers to assign research to a TaskTeam member.
 *
 * OPENS WHEN: Manager clicks "Assign Research" on a client card
 * CALLS:      POST /api/clients/:id/research/assign
 * CLOSES:     On success, after successful assignment
 *
 * FORM FIELDS:
 *   - TaskTeam member (react-select dropdown, fetched from API)
 *   - Research priority (High/Medium/Low/Urgent)
 *   - Note for researcher (textarea)
 *
 * STATE MANAGEMENT:
 *   This drawer manages its own form state (local useState).
 *   On successful submit, it calls `onSuccess()` which triggers
 *   SWR's mutate() to refresh the client list.
 *
 * FILE LOCATION: src/components/clients/AssignResearchDrawer.jsx
 */

"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import Select from "react-select";
import axios from "axios";
import { CLIENT_ROUTES } from "@/utils/routes";
import { cn } from "@/lib/cn";
import apiClient from "@/lib/apiClient";
import { apiPath } from "@/utils/routes";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const PRIORITY_STYLES = {
  Low: "text-[#A99BD4]",
  Medium: "text-[#E1C9FF]",
  High: "text-[#FCD34D]",
  Urgent: "text-[#FCA5A5]",
};

/* ── react-select custom styles to match the drawer's dark-purple theme ── */
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(20, 15, 43, 0.7)",
    borderColor: state.isFocused
      ? "#B797FF"
      : "rgba(69, 44, 149, 0.5)",
    borderRadius: 10,
    padding: "2px 4px",
    fontSize: "13.5px",
    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(183, 151, 255, 0.12)"
      : "none",
    "&:hover": {
      borderColor: "rgba(127, 86, 217, 0.6)",
    },
    minHeight: 42,
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1E1740",
    border: "1px solid rgba(69, 44, 149, 0.5)",
    borderRadius: 10,
    zIndex: 100,
  }),
  menuList: (base) => ({
    ...base,
    padding: 4,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "rgba(127, 86, 217, 0.2)"
      : "transparent",
    color: state.isSelected ? "#B797FF" : "#F5F0FF",
    borderRadius: 8,
    fontSize: "13.5px",
    padding: "8px 12px",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "rgba(127, 86, 217, 0.3)",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#F5F0FF",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6F618F",
  }),
  input: (base) => ({
    ...base,
    color: "#F5F0FF",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#B797FF" : "#6F618F",
    "&:hover": { color: "#B797FF" },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "#6F618F",
    fontSize: "13px",
  }),
  loadingMessage: (base) => ({
    ...base,
    color: "#6F618F",
    fontSize: "13px",
  }),
};

export default function AssignResearchDrawer({
  open,
  onOpenChange,
  client,
  onSuccess,
}) {
  const [taskTeamUsername, setTaskTeamUsername] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [taskTeamOptions, setTaskTeamOptions] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [priority, setPriority] = useState("High");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch TaskTeam members when drawer opens
  useEffect(() => {
    if (!open) return;

    const fetchTaskTeamMembers = async () => {
      setLoadingMembers(true);
      try {
        const res = await axios.get(
          `${apiPath.prodPath}/api/users/allusers`
        );
        const options = res.data
          .filter((user) => user.role === "TaskTeam")
          .map((user) => ({
            value: user.username,
            label: `${user.firstName} ${user.secondName}`,
          }));
        setTaskTeamOptions(options);
      } catch (err) {
        console.error("[fetchTaskTeamMembers]", err);
        setError("Failed to load TaskTeam members.");
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchTaskTeamMembers();
  }, [open]);

  // Reset form when drawer opens with a new client
  useEffect(() => {
    if (open) {
      setTaskTeamUsername("");
      setSelectedMember(null);
      setPriority("High");
      setNote("");
      setError(null);
    }
  }, [open, client?._id]);

  const handleMemberSelect = (option) => {
    setSelectedMember(option);
    setTaskTeamUsername(option ? option.value : "");
  };

  const handleSubmit = async () => {
    if (!taskTeamUsername) {
      setError("Please select a TaskTeam member.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post(CLIENT_ROUTES.assignResearch(client._id), {
        taskTeamUsername,
        priority,
        note,
      });

      // Success — close drawer and refresh the list
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign research. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
                Assign{" "}
                <span className="italic text-[#B797FF]">research</span>
              </Dialog.Title>
              <Dialog.Description className="text-[11px] text-[#6F618F] mt-0.5">
                Assign a TaskTeam member to research this client
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
            {/* Client preview card */}
            <div className="bg-[rgba(25,21,38,0.55)] border border-[rgba(69,44,149,0.4)] rounded-[14px] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center text-white text-[13px] font-semibold">
                {(client.clientName || "?")[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-white font-medium text-[14px]">
                  {client.companyName?.trim() || client.clientName}
                </div>
                <div className="text-[12px] text-[#A99BD4]">
                  {client.primaryContact || client.email || "No contact"}
                </div>
                <div className="text-[11px] text-[#6F618F] mt-0.5">
                  Current status:{" "}
                  <span className="text-[#FCD34D]">
                    {client.researchStatus || "No Research Done"}
                  </span>
                </div>
              </div>
            </div>

            {/* TaskTeam member selector — react-select */}
            <div>
              <label className="text-[11px] text-[#A99BD4] font-medium tracking-[0.04em] uppercase block mb-1.5">
                Assign to TaskTeam member
              </label>
              <Select
                options={taskTeamOptions}
                value={selectedMember}
                onChange={handleMemberSelect}
                placeholder="Select a TaskTeam member…"
                isLoading={loadingMembers}
                isClearable
                isSearchable
                styles={selectStyles}
                noOptionsMessage={() =>
                  loadingMembers
                    ? "Loading members…"
                    : "No TaskTeam members found"
                }
              />
            </div>

            {/* Priority selector */}
            <div>
              <label className="text-[11px] text-[#A99BD4] font-medium tracking-[0.04em] uppercase block mb-2">
                Research priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    className={cn(
                      "bg-[rgba(25,21,38,0.55)] border rounded-[10px] p-3 text-center text-[12.5px] font-medium cursor-pointer transition-all",
                      priority === p
                        ? "border-[#B797FF] bg-[rgba(127,86,217,0.2)]"
                        : "border-[rgba(69,44,149,0.4)] hover:border-[rgba(127,86,217,0.5)]",
                      PRIORITY_STYLES[p]
                    )}
                    onClick={() => setPriority(p)}
                    type="button"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-[11px] text-[#A99BD4] font-medium tracking-[0.04em] uppercase block mb-1.5">
                Note for researcher
              </label>
              <textarea
                className="w-full bg-[rgba(20,15,43,0.7)] border border-[rgba(69,44,149,0.5)] rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-[#F5F0FF] outline-none focus:border-[#B797FF] focus:shadow-[0_0_0_3px_rgba(183,151,255,0.12)] transition-all resize-none"
                rows={3}
                placeholder="Focus on competitor analysis, SEO metrics, decision maker contacts…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13.5px] font-medium bg-gradient-to-b from-[#9B74F0] to-[#6B42C8] text-white shadow-[0_6px_20px_-6px_rgba(127,86,217,0.7),0_1px_0_rgba(255,255,255,0.2)_inset] hover:brightness-110 hover:-translate-y-px transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {submitting ? "Assigning…" : "Assign research"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}