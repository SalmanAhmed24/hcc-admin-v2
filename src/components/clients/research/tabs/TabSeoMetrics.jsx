"use client";

/*
 * TabSeoMetrics.jsx — Tab 3
 * PATCH /:id/research/report/seo
 *
 * Each save appends a timestamped entry to seoHistory (backend) AND updates
 * researchReport.seoMetrics with the latest values.
 * The history panel below reads client.seoHistory (passed via tabProps).
 *
 * NOTE: the backend must also return seoHistory in both:
 *   GET  /research/report  → res.data.client.seoHistory
 *   PATCH /research/report/seo → res.data.seoHistory  (see ResearchDrawer handleSave)
 */

import { useState, useEffect } from "react";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import DrawerShell, {
  SectionLabel, Field, Input, Toggle, MetricCard, AiBanner,
  ghostBtnStyle,
} from "../../DrawerShell";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY = {
  authorityScore: null, domainRating: null, referringDomains: null,
  backlinks: null, organicTraffic: null, organicKeywords: null,
  speedMobile: null, speedDesktop: null,
  lcp: null, fid: null, cls: null,
  indexedPages: null, brokenLinks: null,
  ssl: false, mobileFriendly: false, schemaMarkup: false,
  sitemapPresent: false, robotsTxt: false,
  gmbProfile: false, gmbReviews: null, gmbRating: null,
  benchmarkAuthorityScore: null, benchmarkReferringDomains: null,
  benchmarkTraffic: null, benchmarkSpeedMobile: null,
  benchmarkSpeedDesktop: null, benchmarkGmbReviews: null,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(n) {
  if (n == null || n === "") return "—";
  return Number(n).toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY ENTRY CARD
// ─────────────────────────────────────────────────────────────────────────────

function HistoryEntry({ entry, index }) {
  const [expanded, setExpanded] = useState(false);

  const date = entry.capturedAt ? new Date(entry.capturedAt) : null;
  const dateStr = date
    ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : entry.period || "Unknown date";

  const keyMetrics = [
    { label: "Auth",     value: entry.authorityScore },
    { label: "Traffic",  value: entry.organicTraffic },
    { label: "DR",       value: entry.domainRating },
    { label: "Keywords", value: entry.organicKeywords },
    { label: "Ref Dom",  value: entry.referringDomains },
    { label: "GMB ★",   value: entry.gmbRating },
  ];

  const detailMetrics = [
    { label: "Backlinks",    value: fmt(entry.backlinks) },
    { label: "GMB Reviews",  value: fmt(entry.gmbReviews) },
    { label: "Captured by",  value: entry.capturedByUser?.name || entry.capturedBy || "manual" },
  ];

  return (
    <div
      style={{
        background: "rgba(45,36,91,0.5)",
        border: "1.5px solid rgba(197,168,255,0.18)",
        borderRadius: 12, marginBottom: 8, overflow: "hidden",
      }}
    >
      {/* ── Collapsed row ── */}
      <button
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%", padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 12,
          background: "transparent", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Index badge */}
        <span
          style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "rgba(197,168,255,0.12)",
            border: "1px solid rgba(197,168,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#C5A8FF", flexShrink: 0,
          }}
        >
          {index + 1}
        </span>

        {/* Date */}
        <span style={{ fontSize: 12, fontWeight: 700, color: "#D4BAFF", minWidth: 95, flexShrink: 0 }}>
          {dateStr}
        </span>

        {/* Key metrics chips */}
        <div style={{ flex: 1, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {keyMetrics.map(({ label, value }) => (
            <span
              key={label}
              style={{
                fontSize: 11,
                color: value != null ? "#E0D5FF" : "#6B5F8A",
              }}
            >
              <span style={{ color: "#A99BD4", marginRight: 2 }}>{label}:</span>
              {fmt(value)}
            </span>
          ))}
        </div>

        <span style={{ color: "#A99BD4", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div
          style={{
            padding: "10px 14px 14px",
            borderTop: "1px solid rgba(197,168,255,0.12)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {detailMetrics.map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "#A99BD4", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, color: "#FFFFFF", fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
          {entry.notes && (
            <div
              style={{
                marginTop: 10, padding: "8px 10px",
                background: "rgba(197,168,255,0.06)",
                borderRadius: 8, fontSize: 12, color: "#C5B8E8", fontStyle: "italic",
              }}
            >
              {entry.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function TabSeoMetrics({ client, report, onSave, onSaveNext, isSaved }) {
  const [form,           setForm]           = useState(EMPTY);
  const [saving,         setSaving]         = useState(false);
  const [lastSaved,      setLastSaved]      = useState(null);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [showHistory,    setShowHistory]    = useState(true);
  const [captureDate,    setCaptureDate]    = useState(todayISO);

  // seoHistory lives on the client document, not inside researchReport
  const seoHistory = Array.isArray(client?.seoHistory)
    ? [...client.seoHistory].reverse()   // newest first
    : [];

  useEffect(() => {
    if (report?.seoMetrics) {
      setForm({ ...EMPTY, ...report.seoMetrics });
    }
  }, [report]);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      // capturedAt lets the backend use it if the user backdated the entry
      const payload = { ...form, capturedAt: captureDate || null };
      if (andNext) await onSaveNext("seo", payload);
      else         await onSave("seo", payload);
      setLastSaved(new Date());
      setCaptureDate(todayISO());   // reset to today after each save
    } finally {
      setSaving(false);
    }
  };

  const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 };
  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 };

  //  headerRight={
  //       <button style={ghostBtnStyle()} onClick={() => {}}>
  //         ✦ AI autofill
  //       </button>
  //     }

  return (
    <DrawerShell
      title="SEO Metrics"
      subtitle="Each save records a new timestamped snapshot in history"
      saving={saving}
      lastSaved={lastSaved}
      onSave={() => handleSave(false)}
      onSaveNext={() => handleSave(true)}
     
    >
      {/* <AiBanner text="The AI agent can populate these fields automatically using Ahrefs + Google PageSpeed APIs. Manual entries override agent data." /> */}

      {/* ── Snapshot date ── */}
      <div style={{ marginBottom: 20 }}>
        <Field label="Snapshot date" hint="Default is today — change to backdate a historical entry">
          <input
            type="date"
            value={captureDate}
            onChange={(e) => setCaptureDate(e.target.value)}
            style={dateInputStyle}
          />
        </Field>
      </div>

      {/* ── Authority & Backlinks ── */}
      <SectionLabel>Authority &amp; backlinks</SectionLabel>
      <div style={grid3}>
        <MetricCard label="Authority score /100"  value={form.authorityScore}   onChange={set("authorityScore")}   benchmark={form.benchmarkAuthorityScore ?? 40} />
        <MetricCard label="Domain rating /100"    value={form.domainRating}     onChange={set("domainRating")}     benchmark={35} />
        <MetricCard label="Referring domains"     value={form.referringDomains} onChange={set("referringDomains")} benchmark={form.benchmarkReferringDomains} />
        <MetricCard label="Backlinks total"       value={form.backlinks}        onChange={set("backlinks")} />
        <MetricCard label="Organic traffic / mo"  value={form.organicTraffic}   onChange={set("organicTraffic")}   benchmark={form.benchmarkTraffic} />
        <MetricCard label="Organic keywords"      value={form.organicKeywords}  onChange={set("organicKeywords")} />
      </div>

      {/* ── Page Speed ── */}
      <SectionLabel>Page speed</SectionLabel>
      <div style={grid2}>
        <MetricCard label="Mobile speed /100"  value={form.speedMobile}  onChange={set("speedMobile")}  benchmark={form.benchmarkSpeedMobile ?? 80} />
        <MetricCard label="Desktop speed /100" value={form.speedDesktop} onChange={set("speedDesktop")} benchmark={form.benchmarkSpeedDesktop ?? 90} />
      </div>

      {/* ── Core Web Vitals ── */}
      <SectionLabel>Core Web Vitals</SectionLabel>
      <div style={grid3}>
        <MetricCard label="LCP — load (seconds)"   value={form.lcp} onChange={set("lcp")} benchmark="< 2.5s" />
        <MetricCard label="FID — input delay (ms)" value={form.fid} onChange={set("fid")} benchmark="< 100ms" />
        <MetricCard label="CLS — layout shift"     value={form.cls} onChange={set("cls")} benchmark="< 0.1" />
      </div>

      {/* ── Technical Health ── */}
      <SectionLabel>Technical health</SectionLabel>
      <div style={grid2}>
        <Field label="Indexed pages"><Input value={form.indexedPages} onChange={set("indexedPages")} type="number" placeholder="e.g. 24" /></Field>
        <Field label="Broken links"><Input value={form.brokenLinks}  onChange={set("brokenLinks")}  type="number" placeholder="e.g. 3"  /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Toggle checked={form.ssl}            onChange={set("ssl")}            label="SSL certificate" />
        <Toggle checked={form.mobileFriendly} onChange={set("mobileFriendly")} label="Mobile friendly" />
        <Toggle checked={form.schemaMarkup}   onChange={set("schemaMarkup")}   label="Schema markup" />
        <Toggle checked={form.sitemapPresent} onChange={set("sitemapPresent")} label="Sitemap present" />
        <Toggle checked={form.robotsTxt}      onChange={set("robotsTxt")}      label="Robots.txt" />
      </div>

      {/* ── Google Business Profile ── */}
      <SectionLabel>Google Business Profile</SectionLabel>
      <div style={{ marginBottom: 12 }}>
        <Toggle checked={form.gmbProfile} onChange={set("gmbProfile")} label="GMB profile exists" />
      </div>
      <div style={grid3}>
        <MetricCard label="GMB reviews"   value={form.gmbReviews} onChange={set("gmbReviews")} benchmark={form.benchmarkGmbReviews ?? "20+"} />
        <MetricCard label="GMB rating /5" value={form.gmbRating}  onChange={set("gmbRating")}  benchmark="4.0+" />
      </div>

      {/* ── Industry benchmarks (collapsible) ── */}
      <button
        onClick={() => setShowBenchmarks((p) => !p)}
        style={{ ...ghostBtnStyle(), marginBottom: 12, fontSize: 12 }}
      >
        {showBenchmarks ? "▲" : "▼"} Industry benchmarks
      </button>
      {showBenchmarks && (
        <>
          <SectionLabel>Industry benchmark overrides</SectionLabel>
          <div style={grid3}>
            <Field label="Auth score benchmark">        <Input value={form.benchmarkAuthorityScore}   onChange={set("benchmarkAuthorityScore")}   type="number" /></Field>
            <Field label="Referring domains benchmark"> <Input value={form.benchmarkReferringDomains} onChange={set("benchmarkReferringDomains")} type="number" /></Field>
            <Field label="Traffic benchmark">           <Input value={form.benchmarkTraffic}          onChange={set("benchmarkTraffic")}          type="number" /></Field>
            <Field label="Mobile speed benchmark">      <Input value={form.benchmarkSpeedMobile}      onChange={set("benchmarkSpeedMobile")}      type="number" /></Field>
            <Field label="Desktop speed benchmark">     <Input value={form.benchmarkSpeedDesktop}     onChange={set("benchmarkSpeedDesktop")}     type="number" /></Field>
            <Field label="GMB reviews benchmark">       <Input value={form.benchmarkGmbReviews}       onChange={set("benchmarkGmbReviews")}       type="number" /></Field>
          </div>
        </>
      )}

      {/* ── Snapshot History ── */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => setShowHistory((p) => !p)}
          style={{
            ...ghostBtnStyle(),
            width: "100%", justifyContent: "center",
            borderStyle: seoHistory.length === 0 ? "dashed" : "solid",
            marginBottom: showHistory && seoHistory.length > 0 ? 12 : 0,
          }}
        >
          <History size={13} />
          {showHistory ? "Hide" : "Show"} snapshot history
          {seoHistory.length > 0 && (
            <span
              style={{
                marginLeft: 6, padding: "1px 8px",
                background: "rgba(197,168,255,0.15)",
                borderRadius: 99, fontSize: 11, fontWeight: 700, color: "#C5A8FF",
              }}
            >
              {seoHistory.length}
            </span>
          )}
        </button>

        {showHistory && (
          <>
            {seoHistory.length === 0 ? (
              <div
                style={{
                  marginTop: 10, padding: "20px 16px",
                  background: "rgba(45,36,91,0.3)",
                  border: "1.5px dashed rgba(197,168,255,0.2)",
                  borderRadius: 12, textAlign: "center",
                  fontSize: 13, color: "#A99BD4",
                }}
              >
                No snapshots yet — save your first entry above.
              </div>
            ) : (
              <div>
                <SectionLabel>Snapshot history — newest first</SectionLabel>
                {seoHistory.map((entry, i) => (
                  <HistoryEntry key={entry._id || i} entry={entry} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DrawerShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const dateInputStyle = {
  width: "100%",
  background: "#FFFFFF",
  border: "1.5px solid rgba(127,86,217,0.35)",
  borderRadius: 10,
  padding: "9px 13px",
  fontSize: 14,
  color: "#1A1240",
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};
