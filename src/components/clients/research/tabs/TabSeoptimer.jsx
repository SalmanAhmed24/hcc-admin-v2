"use client";

/*
 * TabSeoptimer.jsx — Tab 5b
 * PATCH /:id/research/report/seoptimer  (multipart)
 *
 * SEOptimer letter grades for: On-Page SEO, Usability, Performance,
 * Links, GEO, and Overall score. Two ways to fill them:
 *   1. Pick the letters manually (as shown in the SEOptimer report)
 *   2. Upload the SEOptimer PDF — the backend uploads it to client files
 *      (AWS S3) and parses the grades out of the PDF automatically.
 *
 * Always sends FormData so the same endpooint handles both modes.
 *
 * FILE LOCATION: src/components/clients/research/tabs/TabSeoptimer.jsx
 */

import { useState, useEffect, useRef } from "react";
import DrawerShell, { SectionLabel } from "../../DrawerShell";

// All grades SEOptimer can assign
const GRADES = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"];

const EMPTY = {
  onPageSeoGrade:   "",
  usabilityGrade:   "",
  performanceGrade: "",
  linksGrade:       "",
  geoGrade:         "",
  overallGrade:     "",
};

const FIELDS = [
  { key: "overallGrade",     label: "Overall Score" },
  { key: "onPageSeoGrade",   label: "On-Page SEO" },
  { key: "usabilityGrade",   label: "Usability" },
  { key: "performanceGrade", label: "Performance" },
  { key: "linksGrade",       label: "Links" },
  { key: "geoGrade",         label: "GEO" },
];

// Grade → display color (A=green, B=teal, C=amber, D=orange, F=red)
function gradeColor(g) {
  if (!g) return "#6F618F";
  const letter = g[0];
  if (letter === "A") return "#4ADE80";
  if (letter === "B") return "#2DD4BF";
  if (letter === "C") return "#FBBF24";
  if (letter === "D") return "#FB923C";
  return "#F87171";
}

export default function TabSeoptimer({ client, report, onSave, onSaveNext }) {
  const [form, setForm]           = useState(EMPTY);
  const [file, setFile]           = useState(null);
  const [saving, setSaving]       = useState(false);
  const [dragging, setDragging]   = useState(false);
  const fileRef = useRef(null);

  // ── Load existing data from report ──────────────────────────────────────
  useEffect(() => {
    if (report?.seoptimerReport) {
      const r = report.seoptimerReport;
      setForm({
        onPageSeoGrade:   r.onPageSeoGrade   || "",
        usabilityGrade:   r.usabilityGrade   || "",
        performanceGrade: r.performanceGrade || "",
        linksGrade:       r.linksGrade       || "",
        geoGrade:         r.geoGrade         || "",
        overallGrade:     r.overallGrade     || "",
      });
    }
  }, [report]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  // ── Build FormData (grades + optional PDF) and save ─────────────────────
  const buildPayload = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (file) fd.append("reportFile", file);
    return fd;
  };

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      if (andNext) await onSaveNext("seoptimer", buildPayload());
      else         await onSave("seoptimer", buildPayload());
      setFile(null); // file is uploaded — clear the staged one
    } finally { setSaving(false); }
  };

  // ── Existing uploaded report (from a previous save) ──────────────────────
  const existingFile = report?.seoptimerReport?.reportFileUrl;
  const existingName = report?.seoptimerReport?.reportFileName;

  const selectStyle = {
    width: "100%", background: "rgba(20,15,43,0.7)",
    border: "1px solid rgba(69,44,149,0.5)", borderRadius: 10,
    padding: "10px 12px", color: "#F5F0FF", fontSize: 14,
    outline: "none", cursor: "pointer",
  };

  return (
    <DrawerShell
      title="SEOptimer Report"
      subtitle="Letter grades from the SEOptimer audit — enter manually or upload the PDF to auto-fill"
      saving={saving}
      onSave={() => handleSave(false)}
      onSaveNext={() => handleSave(true)}
    >
      {/* ── Upload zone ──────────────────────────────────────────────── */}
      <SectionLabel>Upload SEOptimer PDF (optional — auto-fills grades)</SectionLabel>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) setFile(f);
        }}
        style={{
          border: `2px dashed ${dragging ? "#B797FF" : "rgba(127,86,217,0.4)"}`,
          borderRadius: 12, padding: "18px 16px", textAlign: "center",
          cursor: "pointer", marginBottom: 12,
          background: dragging ? "rgba(127,86,217,0.08)" : "rgba(20,15,43,0.4)",
        }}
      >
        <input
          ref={fileRef} type="file" accept=".pdf,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
        />
        <div style={{ fontSize: 20, marginBottom: 4 }}>📄</div>
        <div style={{ fontSize: 12.5, color: "#A99BD4" }}>
          Drag the SEOptimer PDF here or <span style={{ color: "#B797FF", textDecoration: "underline" }}>browse</span>
        </div>
        <div style={{ fontSize: 11, color: "#6F618F", marginTop: 4 }}>
          File is stored in this client&apos;s files (AWS) and parsed for grades on save
        </div>
      </div>

      {/* Staged file chip */}
      {file && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
          padding: "8px 12px", borderRadius: 10,
          background: "rgba(127,86,217,0.12)", border: "1px solid rgba(127,86,217,0.35)",
          fontSize: 12.5, color: "#E1C9FF",
        }}>
          <span>📎</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
          <span style={{ color: "#6F618F", fontSize: 11 }}>{(file.size / 1024 / 1024).toFixed(1)} MB — will upload on save</span>
          <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
            style={{ background: "none", border: "none", color: "#A99BD4", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
        </div>
      )}

      {/* Previously uploaded report */}
      {existingFile && !file && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
          padding: "8px 12px", borderRadius: 10,
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
          fontSize: 12.5, color: "#4ADE80",
        }}>
          <span>✓</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Report on file: {existingName || "SEOptimer report"}
          </span>
          <a href={existingFile} target="_blank" rel="noreferrer"
            style={{ color: "#B797FF", fontSize: 12, textDecoration: "underline" }}>
            View
          </a>
        </div>
      )}

      {/* ── Letter grades ────────────────────────────────────────────── */}
      <SectionLabel>Letter Grades (as shown in SEOptimer)</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label style={{
              fontSize: 11, fontWeight: 600, color: "#A99BD4",
              textTransform: "uppercase", letterSpacing: "0.06em",
              marginBottom: 5, display: "block",
            }}>
              {label}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select value={form[key]} onChange={set(key)} style={selectStyle}>
                <option value="">— Not set —</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {/* Grade badge preview */}
              <span style={{
                minWidth: 34, height: 34, borderRadius: "50%",
                border: `3px solid ${gradeColor(form[key])}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: gradeColor(form[key]),
                flexShrink: 0,
              }}>
                {form[key] || "–"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: "#6F618F", lineHeight: 1.5, margin: 0 }}>
        These grades feed the <b style={{ color: "#A99BD4" }}>HCC Proposal</b> email templates
        (dark &amp; light). If a grade is left unset, emails fall back to a below-average
        assumed value so placeholders are never empty.
      </p>
    </DrawerShell>
  );
}
