"use client";

/*
 * TabGeoUsability.jsx — Tab 5
 * PATCH /:id/research/report/geousability
 *
 * Two sections:
 *   1. GEO (AI Search Visibility) — metrics from SEMrush/DataForSEO about
 *      how well the site appears in AI-powered search (ChatGPT, Google AI Overviews, etc.)
 *   2. Usability — mobile UX, navigation, accessibility, form/CTA quality, readability
 *
 * Overall scores are computed server-side on save via weighted averages.
 * When data is missing, the email template uses below-average defaults.
 *
 * FILE LOCATION: src/components/clients/research/tabs/TabGeoUsability.jsx
 */

import { useState, useEffect } from "react";
import DrawerShell, {
  SectionLabel, Field, Input, Toggle, MetricCard,
} from "../../DrawerShell";

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY — default / pristine state for all form fields
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY = {
  // GEO
  aiOverviewPresence:  false,
  aiCitationCount:     null,
  aiVisibilityScore:   null,
  chatbotMentions:     null,
  structuredDataScore: null,
  contentEeatScore:    null,
  // Usability
  mobileUsabilityScore: null,
  navigationScore:      null,
  accessibilityScore:   null,
  responsiveDesign:     false,
  formUsability:        null,
  readabilityScore:     null,
};

export default function TabGeoUsability({ client, report, onSave, onSaveNext }) {
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // ── Load existing data from report ──────────────────────────────────────
  useEffect(() => {
    if (report?.geoUsability) setForm({ ...EMPTY, ...report.geoUsability });
  }, [report]);

  // ── Setter factory for form fields ──────────────────────────────────────
  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  // ── Save handler — delegates to ResearchDrawer's handleSave ─────────────
  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      if (andNext) await onSaveNext("geousability", form);
      else         await onSave("geousability", form);
      setLastSaved(new Date());
    } finally { setSaving(false); }
  };

  // ── Layout grids ────────────────────────────────────────────────────────
  const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 };
  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 };

  // ── Computed score badges (read-only, set by backend on last save) ──────
  const geoScore  = report?.geoUsability?.geoOverallScore;
  const geoGrade  = report?.geoUsability?.geoGrade;
  const usabScore = report?.geoUsability?.usabilityOverallScore;
  const usabGrade = report?.geoUsability?.usabilityGrade;

  return (
    <DrawerShell
      title="GEO & Usability"
      subtitle="AI search visibility (SEMrush / DataForSEO) and site usability metrics"
      saving={saving}
      lastSaved={lastSaved}
      onSave={() => handleSave(false)}
      onSaveNext={() => handleSave(true)}
    >
      {/* ── Computed score summary (read-only) ─────────────────────────── */}
      {(geoScore != null || usabScore != null) && (
        <div style={{
          display: "flex", gap: 16, marginBottom: 20, padding: "12px 16px",
          background: "rgba(127,86,217,0.08)", border: "1px solid rgba(127,86,217,0.2)",
          borderRadius: 12,
        }}>
          {geoScore != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 13,
              }}>{geoGrade}</span>
              <div>
                <div style={{ fontSize: 10, color: "#A99BD4", textTransform: "uppercase", letterSpacing: "0.1em" }}>GEO Score</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{geoScore}/100</div>
              </div>
            </div>
          )}
          {usabScore != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 13,
              }}>{usabGrade}</span>
              <div>
                <div style={{ fontSize: 10, color: "#A99BD4", textTransform: "uppercase", letterSpacing: "0.1em" }}>Usability Score</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{usabScore}/100</div>
              </div>
            </div>
          )}
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#6B5F8A", alignSelf: "center" }}>
            Computed on save
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* GEO — AI Search Visibility                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionLabel>GEO — AI Search Visibility</SectionLabel>

      <div style={{ marginBottom: 14 }}>
        <Toggle
          checked={form.aiOverviewPresence}
          onChange={set("aiOverviewPresence")}
          label="Appears in Google AI Overviews"
        />
      </div>

      <div style={grid3}>
        <MetricCard
          label="AI Visibility Score /100"
          value={form.aiVisibilityScore}
          onChange={set("aiVisibilityScore")}
          benchmark="50+"
        />
        <MetricCard
          label="Structured Data Score /100"
          value={form.structuredDataScore}
          onChange={set("structuredDataScore")}
          benchmark="60+"
        />
        <MetricCard
          label="Content E-E-A-T Score /100"
          value={form.contentEeatScore}
          onChange={set("contentEeatScore")}
          benchmark="50+"
        />
      </div>

      <div style={grid2}>
        <MetricCard
          label="AI Citation Count"
          value={form.aiCitationCount}
          onChange={set("aiCitationCount")}
          benchmark="5+"
        />
        <MetricCard
          label="Chatbot Mentions"
          value={form.chatbotMentions}
          onChange={set("chatbotMentions")}
          benchmark="3+"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Usability                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionLabel>Usability</SectionLabel>

      <div style={{ marginBottom: 14 }}>
        <Toggle
          checked={form.responsiveDesign}
          onChange={set("responsiveDesign")}
          label="Responsive design (passes Google mobile-friendly test)"
        />
      </div>

      <div style={grid3}>
        <MetricCard
          label="Mobile Usability /100"
          value={form.mobileUsabilityScore}
          onChange={set("mobileUsabilityScore")}
          benchmark="70+"
        />
        <MetricCard
          label="Navigation Score /100"
          value={form.navigationScore}
          onChange={set("navigationScore")}
          benchmark="65+"
        />
        <MetricCard
          label="Accessibility Score /100"
          value={form.accessibilityScore}
          onChange={set("accessibilityScore")}
          benchmark="60+"
        />
      </div>

      <div style={grid2}>
        <MetricCard
          label="Form / CTA Usability /100"
          value={form.formUsability}
          onChange={set("formUsability")}
          benchmark="60+"
        />
        <MetricCard
          label="Readability Score /100"
          value={form.readabilityScore}
          onChange={set("readabilityScore")}
          benchmark="60+"
        />
      </div>
    </DrawerShell>
  );
}
