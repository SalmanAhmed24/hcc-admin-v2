"use client";

/*
 * ResearchDrawer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-tab research drawer. Opens as a full-height right-side panel.
 * Manages tab state, loads existing draft data, and orchestrates all tab saves.
 *
 * TABS:
 *   1. Company Info      → saveReportCompanyInfo
 *   2. Social Media      → existing addResearchSocialMedia (unchanged)
 *   3. SEO Metrics       → saveReportSeoMetrics
 *   4. Local SEO         → saveReportLocalSeo
 *   5. Keywords          → saveReportKeywords
 *   6. Competitors       → saveReportCompetitors
 *   7. Opportunity Score → saveReportOpportunityScore
 *   8. Summary           → saveReportSummary
 *   9. Submit            → completeResearchReport + export
 *
 * FILE LOCATION: src/components/research/ResearchDrawer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  X, Building2, Globe, BarChart3, MapPin, Key,
  Users2, Target, FileText, Send, CheckCircle2,
  ChevronRight, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import apiClient from "@/lib/apiClient";
import { CLIENT_ROUTES } from "@/utils/routes";

// Tab components
import TabCompanyInfo      from "./research/tabs/TabCompanyInfo";
import TabSocialMedia      from "./research/tabs/TabSocialMedia";
import TabSeoMetrics       from "./research/tabs/TabSeoMetrics";
import TabLocalSeo         from "./research/tabs/TabLocalSeo";
import TabKeywords         from "./research/tabs/TabKeywords";
import TabCompetitors      from "./research/tabs/TabCompetitors";
import TabOpportunity      from "./research/tabs/TabOpportunity";
import TabSummary          from "./research/tabs/TabSummary";
import TabSubmit           from "./research/tabs/TabSubmit";

// ─────────────────────────────────────────────────────────────────────────────
// TAB CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "company",     label: "Company info",    icon: Building2,  endpoint: "company",     required: false },
  { id: "social",      label: "Social media",    icon: Globe,      endpoint: "social",      required: false },
  { id: "seo",         label: "SEO metrics",     icon: BarChart3,  endpoint: "seo",         required: true  },
  { id: "localseo",    label: "Local SEO",       icon: MapPin,     endpoint: "localseo",    required: false },
  { id: "keywords",    label: "Keywords",        icon: Key,        endpoint: "keywords",    required: true  },
  { id: "competitors", label: "Competitors",     icon: Users2,     endpoint: "competitors", required: false },
  { id: "opportunity", label: "Opportunity",     icon: Target,     endpoint: "opportunity", required: false },
  { id: "summary",     label: "Summary",         icon: FileText,   endpoint: "summary",     required: false },
  { id: "submit",      label: "Submit",          icon: Send,       endpoint: null,          required: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ResearchDrawer({ open, onOpenChange, client, onSuccess }) {
  const [activeTab,   setActiveTab]   = useState("company");
  const [savedTabs,   setSavedTabs]   = useState({});       // { seo: true, keywords: true }
  const [loadingData, setLoadingData] = useState(false);
  const [reportData,  setReportData]  = useState(null);     // full researchReport from DB
  const [clientData,  setClientData]  = useState(null);     // company fields for pre-fill
  const [saveStatus,  setSaveStatus]  = useState("");        // "saving" | "saved" | "error"

  // ── Load existing draft when drawer opens ──────────────────────────────────
  useEffect(() => {
    if (!open || !client?._id) return;
    setActiveTab("company");
    setSaveStatus("");

    const load = async () => {
      setLoadingData(true);
      try {
        const res = await apiClient.get(CLIENT_ROUTES.researchReport(client._id));
        setClientData(res.data.client);
        setReportData(res.data.report);

        // Mark tabs as saved if data already exists
        const report = res.data.report;
        if (report) {
          const saved = {};
          if (report.seoMetrics?.authorityScore != null) saved.seo         = true;
          if (report.localSeo?.napConsistency   != null) saved.localseo    = true;
          if (report.topKeywords?.length)                saved.keywords    = true;
          if (report.competitors?.length)                saved.competitors = true;
          if (report.opportunityScore?.overallScore != null) saved.opportunity = true;
          if (report.executiveSummary)                   saved.summary     = true;
          setSavedTabs(saved);
        }
      } catch (err) {
        console.error("[ResearchDrawer] load error:", err);
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [open, client?._id]);

  // ── Save handler — called by each tab's Save button ───────────────────────
  const handleSave = useCallback(async (tabId, payload) => {
    if (!client?._id) return;
    setSaveStatus("saving");
    try {
      const url = `${CLIENT_ROUTES.researchReportTab(client._id, tabId)}`;
      const res = await apiClient.patch(url, payload);

      // Update our local report cache with the fresh data
      if (res.data.report)     setReportData(res.data.report);
      if (res.data.client)     setClientData(res.data.client);
      if (res.data.seoHistory) setClientData((prev) => ({ ...prev, seoHistory: res.data.seoHistory }));

      setSavedTabs((prev) => ({ ...prev, [tabId]: true }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch (err) {
      console.error(`[ResearchDrawer] save ${tabId} error:`, err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
      throw err; // let the tab component handle its own error UI too
    }
  }, [client?._id]);

  // ── Advance to next tab after save ────────────────────────────────────────
  const handleSaveAndNext = useCallback(async (tabId, payload) => {
    await handleSave(tabId, payload);
    const currentIdx = TABS.findIndex((t) => t.id === tabId);
    if (currentIdx < TABS.length - 1) {
      setActiveTab(TABS[currentIdx + 1].id);
    }
  }, [handleSave]);

  // ── Submit (complete research) ─────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    const res = await apiClient.post(CLIENT_ROUTES.researchReportComplete(client._id));
    onSuccess?.();
    onOpenChange(false);
    return res.data;
  }, [client?._id, onSuccess, onOpenChange]);

  // ── Export docx ───────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
  try {
    const url = CLIENT_ROUTES.researchReportExport(client._id);

    // apiClient sends the Authorization header correctly
    const response = await apiClient.get(url, {
      responseType: "blob", // tell axios to treat response as binary
    });

    // Create a temporary object URL and trigger browser download
    const blob     = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const blobUrl  = window.URL.createObjectURL(blob);
    const link     = document.createElement("a");
    link.href      = blobUrl;
    link.download  = `SEO_Report_${client.clientName || "client"}_${Date.now()}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl); // clean up memory

  } catch (err) {
    alert(err?.response?.data?.message || "Failed to export report.");
  }
}, [client?._id, client?.clientName]);

  if (!client) return null;

  const displayName = client.companyName?.trim() || client.clientName || "Client";

  // Common props passed to every tab component
  const tabProps = {
    client:     clientData || client,
    report:     reportData,
    onSave:     handleSave,
    onSaveNext: handleSaveAndNext,
    isSaved:    (tabId) => !!savedTabs[tabId],
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{ background: "rgba(8, 5, 20, 0.72)", backdropFilter: "blur(6px)" }}
        />
        <Dialog.Content
          className={cn(
            "fixed top-0 right-0 bottom-0 z-50",
            "flex overflow-hidden",
            "research-drawer",
            // animate in from right
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-0",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-0",
            "duration-300"
          )}
          style={{ width: "min(960px, 96vw)", borderRadius: "16px 0 0 16px", overflow: "hidden" }}
        >
          {/* Accessible title — visually hidden, required by Radix Dialog */}
          <VisuallyHidden.Root>
            <Dialog.Title>
              Research Report — {client?.companyName?.trim() || client?.clientName || "Client"}
            </Dialog.Title>
          </VisuallyHidden.Root>

          {/* ── Sidebar ── */}
          <aside
            style={{
              width: "220px",
              minWidth: "220px",
              background: "linear-gradient(180deg, #2D245B 0%, #241E50 100%)",
              borderRight: "1.5px solid rgba(197,168,255,0.18)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              borderRadius: "16px 0 0 0",
            }}
          >
            {/* Client identity header */}
            <div
              style={{
                padding: "20px 16px 16px",
                borderBottom: "1px solid rgba(197,168,255,0.2)",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 40, height: 40,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #7F56D9 0%, #4A2A9A 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "#F5F0FF",
                  marginBottom: 10,
                  boxShadow: "0 4px 12px rgba(127,86,217,0.4)",
                }}
              >
                {displayName[0]?.toUpperCase() || "?"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3 }}>
                {displayName}
              </div>
              {client.websiteAddress && (
                <div style={{ fontSize: 12, color: "#C5B8E8", marginTop: 3, wordBreak: "break-all" }}>
                  {client.websiteAddress.replace(/^https?:\/\//, "")}
                </div>
              )}
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  marginTop: 8, padding: "3px 8px",
                  background: "rgba(127,86,217,0.15)",
                  border: "1px solid rgba(127,86,217,0.3)",
                  borderRadius: 99,
                  fontSize: 10, fontWeight: 500, color: "#B797FF",
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#B797FF" }} />
                {(clientData || client).researchStatus || "Under Research"}
              </div>
            </div>

            {/* Tab list */}
            <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
              {TABS.map((tab, idx) => {
                const Icon      = tab.icon;
                const isActive  = activeTab === tab.id;
                const isSaved   = savedTabs[tab.id];
                const isSubmit  = tab.id === "submit";

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 10px",
                      borderRadius: 12,
                      background: isActive
                        ? "rgba(155,116,240,0.22)"
                        : "transparent",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#FFFFFF" : isSaved ? "#C5B8E8" : "#A99BD4",
                      textAlign: "left",
                      transition: "all 0.15s",
                      marginTop: isSubmit ? 8 : 0,
                      // Replaced `border` shorthand + `borderTop` non-shorthand
                      // with all four individual sides to avoid React style conflict
                      borderTop:    isSubmit ? "1px solid rgba(197,168,255,0.2)" : isActive ? "1px solid rgba(197,168,255,0.4)" : "1px solid transparent",
                      borderRight:  isActive ? "1px solid rgba(197,168,255,0.4)" : "1px solid transparent",
                      borderBottom: isActive ? "1px solid rgba(197,168,255,0.4)" : "1px solid transparent",
                      borderLeft:   isActive ? "1px solid rgba(197,168,255,0.4)" : "1px solid transparent",
                      paddingTop: isSubmit ? 14 : 8,
                    }}
                  >
                    {/* Number / check badge */}
                    <span
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 600, flexShrink: 0,
                        background: isSaved
                          ? "rgba(74,222,128,0.15)"
                          : isActive
                            ? "rgba(183,151,255,0.2)"
                            : "rgba(255,255,255,0.05)",
                        color: isSaved ? "#4ADE80" : isActive ? "#B797FF" : "#6B5F8A",
                        border: isSaved
                          ? "1px solid rgba(74,222,128,0.3)"
                          : isActive
                            ? "1px solid rgba(183,151,255,0.3)"
                            : "1px solid transparent",
                      }}
                    >
                      {isSaved && !isSubmit
                        ? <CheckCircle2 size={11} />
                        : isSubmit
                          ? <ChevronRight size={11} />
                          : idx + 1}
                    </span>
                    {tab.label}
                    {tab.required && !isSaved && (
                      <span style={{ marginLeft: "auto", fontSize: 9, color: "#F87171" }}>req</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Save status indicator at bottom of sidebar */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid rgba(197,168,255,0.2)",
                fontSize: 12,
                fontWeight: 500,
                color: saveStatus === "saved" ? "#4ADE80"
                     : saveStatus === "error"  ? "#F87171"
                     : saveStatus === "saving" ? "#D4BAFF"
                     : "#A99BD4",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {saveStatus === "saving" && <Loader2 size={11} className="animate-spin" />}
              {saveStatus === "saved"  && <CheckCircle2 size={11} />}
              {saveStatus === "error"  && <AlertCircle size={11} />}
              {saveStatus === "saving" ? "Saving…"
               : saveStatus === "saved"  ? "Saved"
               : saveStatus === "error"  ? "Save failed"
               : "Draft"}
            </div>
          </aside>

          {/* ── Main content area ── */}
          <main
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(180deg, #372D6E 0%, #2D245B 100%)",
              overflow: "hidden",
            }}
          >
            {/* Close button */}
            <div
              style={{
                position: "absolute", top: 14, right: 14, zIndex: 10,
              }}
            >
              <Dialog.Close asChild>
                <button
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    border: "1.5px solid rgba(197,168,255,0.4)",
                    background: "rgba(155,116,240,0.12)",
                    color: "#D4BAFF", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <X size={15} />
                </button>
              </Dialog.Close>
            </div>

            {/* Loading overlay */}
            {loadingData && (
              <div
                style={{
                  position: "absolute", inset: 0, zIndex: 20,
                  background: "rgba(35,28,80,0.88)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 12,
                }}
              >
                <Loader2 size={28} style={{ color: "#D4BAFF" }} className="animate-spin" />
                <span style={{ fontSize: 14, color: "#C5B8E8" }}>Loading research data…</span>
              </div>
            )}

            {/* Tab content — rendered based on activeTab */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {activeTab === "company"     && <TabCompanyInfo      {...tabProps} />}
              {activeTab === "social"      && <TabSocialMedia      {...tabProps} />}
              {activeTab === "seo"         && <TabSeoMetrics       {...tabProps} />}
              {activeTab === "localseo"    && <TabLocalSeo         {...tabProps} />}
              {activeTab === "keywords"    && <TabKeywords         {...tabProps} />}
              {activeTab === "competitors" && <TabCompetitors      {...tabProps} />}
              {activeTab === "opportunity" && <TabOpportunity      {...tabProps} />}
              {activeTab === "summary"     && <TabSummary          {...tabProps} />}
              {activeTab === "submit"      && (
                <TabSubmit
                  {...tabProps}
                  savedTabs={savedTabs}
                  tabs={TABS}
                  onComplete={handleComplete}
                  onExport={handleExport}
                />
              )}
            </div>
          </main>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}