"use client";
/*
 * TabKeywords.jsx — Tab 5
 * PATCH /:id/research/report/keywords
 * FILE LOCATION: src/components/research/tabs/TabKeywords.jsx
 */
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import DrawerShell, { SectionLabel, ghostBtnStyle } from "../../DrawerShell";

const EMPTY_KW = { keyword: "", position: "", searchVolume: "", difficulty: "", trend: "stable" };

const TREND_OPTIONS = [
  { value: "up",     label: "↑ Up",     color: "#4ADE80" },
  { value: "stable", label: "→ Stable", color: "#B797FF" },
  { value: "down",   label: "↓ Down",   color: "#F87171" },
];

function diffColor(val) {
  if (val === "") return "#6B5F8A";
  const n = Number(val);
  if (n < 30) return "#4ADE80";
  if (n < 60) return "#FCD34D";
  return "#F87171";
}

export default function TabKeywords({ client, report, onSave, onSaveNext }) {
  const [keywords, setKeywords]   = useState([{ ...EMPTY_KW }]);
  const [saving, setSaving]       = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (report?.topKeywords?.length) {
      setKeywords(report.topKeywords.map((kw) => ({
        keyword:      kw.keyword      || "",
        position:     kw.position     ?? "",
        searchVolume: kw.searchVolume ?? "",
        difficulty:   kw.difficulty   ?? "",
        trend:        kw.trend        || "stable",
      })));
    }
  }, [report]);

  const addRow    = () => setKeywords((p) => [...p, { ...EMPTY_KW }]);
  const removeRow = (i) => setKeywords((p) => p.filter((_, idx) => idx !== i));
  const updateRow = (i, key, val) =>
    setKeywords((p) => p.map((kw, idx) => idx === i ? { ...kw, [key]: val } : kw));

  const handleSave = async (andNext = false) => {
    setSaving(true);
    try {
      const payload = {
        keywords: keywords.filter((kw) => kw.keyword.trim()).map((kw) => ({
          keyword:      kw.keyword.trim(),
          position:     kw.position     !== "" ? Number(kw.position)     : null,
          searchVolume: kw.searchVolume !== "" ? Number(kw.searchVolume) : null,
          difficulty:   kw.difficulty   !== "" ? Number(kw.difficulty)   : null,
          trend:        kw.trend,
        })),
      };
      if (andNext) await onSaveNext("keywords", payload);
      else         await onSave("keywords", payload);
      setLastSaved(new Date());
    } finally { setSaving(false); }
  };

  const colHdr = { fontSize: 10, fontWeight: 600, color: "#534AB7", textTransform: "uppercase", letterSpacing: "0.06em" };

  return (
    <DrawerShell
      title="Keyword rankings"
      subtitle="Current Google positions — add up to 20 keywords"
      saving={saving}
      lastSaved={lastSaved}
      onSave={() => handleSave(false)}
      onSaveNext={() => handleSave(true)}
    >
      <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 100px 90px 100px 36px", gap: 8, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(127,86,217,0.15)" }}>
        {["Keyword", "Position", "Vol / mo", "Difficulty", "Trend", ""].map((h) => (
          <span key={h} style={colHdr}>{h}</span>
        ))}
      </div>

      {keywords.map((kw, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 80px 100px 90px 100px 36px", gap: 8, marginBottom: 6, alignItems: "center" }}>
          <input value={kw.keyword}      onChange={(e) => updateRow(i, "keyword", e.target.value)}      placeholder="e.g. landscaping austin tx" style={rowInput} />
          <input value={kw.position}     onChange={(e) => updateRow(i, "position", e.target.value)}     type="number" placeholder="1–100" style={{ ...rowInput, textAlign: "center" }} />
          <input value={kw.searchVolume} onChange={(e) => updateRow(i, "searchVolume", e.target.value)} type="number" placeholder="—"     style={{ ...rowInput, textAlign: "center" }} />
          <input value={kw.difficulty}   onChange={(e) => updateRow(i, "difficulty", e.target.value)}   type="number" placeholder="0–100" style={{ ...rowInput, textAlign: "center", color: diffColor(kw.difficulty) }} />
          <select value={kw.trend} onChange={(e) => updateRow(i, "trend", e.target.value)}
            style={{ ...rowInput, color: TREND_OPTIONS.find((t) => t.value === kw.trend)?.color || "#B797FF" }}>
            {TREND_OPTIONS.map((t) => <option key={t.value} value={t.value} style={{ background: "#1A1240" }}>{t.label}</option>)}
          </select>
          <button onClick={() => removeRow(i)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.06)", color: "#F87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {keywords.length < 20 && (
        <button onClick={addRow} style={{ ...ghostBtnStyle(), marginTop: 12, fontSize: 12 }}>
          <Plus size={13} /> Add keyword
        </button>
      )}
    </DrawerShell>
  );
}

const rowInput = {
  width: "100%", background: "rgba(20,14,48,0.7)",
  border: "1px solid rgba(127,86,217,0.2)", borderRadius: 7,
  padding: "6px 9px", fontSize: 12, color: "#F5F0FF", outline: "none", boxSizing: "border-box",
};