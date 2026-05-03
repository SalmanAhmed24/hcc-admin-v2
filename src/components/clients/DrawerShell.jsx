"use client";

/*
 * DrawerShell.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared layout shell used by every tab component.
 * Provides the header (title + subtitle + action buttons),
 * scrollable content area, and sticky footer (last-saved + primary CTA).
 *
 * FILE LOCATION: src/components/research/DrawerShell.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Loader2, CheckCircle2 } from "lucide-react";

export default function DrawerShell({
  title,
  subtitle,
  headerRight,        // ReactNode — buttons in the top-right of the header
  children,           // main scrollable content
  saving = false,
  lastSaved = null,   // Date | null
  onSave,             // primary footer CTA handler
  saveLabel = "Save tab",
  onSaveNext,         // optional "Save & continue" handler
  saveNextLabel = "Save & continue →",
  footerLeft,         // optional left side of footer
}) {
  const savedText = lastSaved
    ? `Saved ${formatRelative(lastSaved)}`
    : "Not yet saved";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "18px 24px 16px",
          borderBottom: "1.5px solid rgba(197,168,255,0.22)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ paddingRight: 12 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#FFFFFF",
              margin: 0,
              fontFamily: "'Instrument Serif', Georgia, serif",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: 13,
                color: "#A99BD4",
                margin: "4px 0 0",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {headerRight && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {headerRight}
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          // Custom scrollbar
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(127,86,217,0.3) transparent",
        }}
      >
        {children}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "12px 24px",
          borderTop: "1.5px solid rgba(197,168,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          background: "rgba(35,28,80,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {footerLeft || (
            <span
              style={{
                fontSize: 12,
                color: lastSaved ? "#4ADE80" : "#A99BD4",
                display: "flex", alignItems: "center", gap: 5,
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              }}
            >
              {lastSaved && <CheckCircle2 size={11} />}
              {savedText}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {onSaveNext && (
            <button
              onClick={onSaveNext}
              disabled={saving}
              style={ghostBtnStyle(saving)}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : null}
              {saveNextLabel}
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              style={primaryBtnStyle(saving)}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : null}
              {saving ? "Saving…" : saveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLE HELPERS (exported for use in tab components)
// ─────────────────────────────────────────────────────────────────────────────

export function primaryBtnStyle(disabled = false) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 18px",
    borderRadius: 10,
    border: "none",
    background: disabled
      ? "rgba(127,86,217,0.3)"
      : "linear-gradient(135deg, #9B74F0 0%, #6B42C8 100%)",
    color: "#FFFFFF",
    fontSize: 14, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    boxShadow: disabled ? "none" : "0 4px 14px rgba(107,66,200,0.4)",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  };
}

export function ghostBtnStyle(disabled = false) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px",
    borderRadius: 10,
    border: "1.5px solid rgba(197,168,255,0.45)",
    background: "rgba(155,116,240,0.12)",
    color: "#D4BAFF",
    fontSize: 14, fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.15s",
    whiteSpace: "nowrap",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  };
}

export function aiBtnStyle() {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px",
    borderRadius: 10,
    border: "1.5px solid rgba(197,168,255,0.45)",
    background: "rgba(155,116,240,0.12)",
    color: "#D4BAFF",
    fontSize: 13, fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED FIELD COMPONENTS (used inside tab forms)
// ─────────────────────────────────────────────────────────────────────────────

export function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 12, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: "#C5A8FF",
        marginBottom: 12, marginTop: 4,
        paddingBottom: 6,
        borderBottom: "1px solid rgba(197,168,255,0.25)",
      }}
    >
      {children}
    </div>
  );
}

export function Field({ label, hint, children, half = false }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 6,
        gridColumn: half ? "span 1" : undefined,
      }}
    >
      <label
        style={{
          fontSize: 13, fontWeight: 600,
          color: "#D4BAFF", letterSpacing: "0.02em",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <span style={{ fontSize: 11, color: "#A99BD4" }}>{hint}</span>
      )}
    </div>
  );
}

export function Input({ value, onChange, type = "text", placeholder = "", ...rest }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      {...rest}
    />
  );
}

export function Textarea({ value, onChange, placeholder = "", rows = 3 }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
    />
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: "flex", alignItems: "center", gap: 8,
        cursor: "pointer", userSelect: "none",
      }}
    >
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 99,
          background: checked ? "#9B74F0" : "rgba(255,255,255,0.12)",
          border: `1px solid ${checked ? "#9B74F0" : "rgba(197,168,255,0.3)"}`,
          position: "relative", transition: "all 0.2s", cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 14, height: 14, borderRadius: "50%",
            background: "#FFFFFF",
            position: "absolute", top: 2,
            left: checked ? 18 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      <span style={{ fontSize: 14, color: "#E0D5FF" }}>{label}</span>
    </label>
  );
}

export function MetricCard({ label, value, onChange, benchmark, type = "number" }) {
  return (
    <div
      style={{
        background: "rgba(45,36,91,0.75)",
        border: "1.5px solid rgba(197,168,255,0.25)",
        borderRadius: 14, padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 12, color: "#C5B8E8", marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
        style={{
          width: "100%", background: "transparent",
          border: "none", fontSize: 24, fontWeight: 700,
          color: "#FFFFFF", padding: 0, outline: "none",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
        placeholder="—"
      />
      {benchmark != null && (
        <div style={{ fontSize: 11, color: "#A99BD4", marginTop: 4 }}>
          Industry avg: {benchmark}
        </div>
      )}
    </div>
  );
}

export function AiBanner({ text, onRun, running = false }) {
  return (
    <div
      style={{
        background: "rgba(155,116,240,0.14)",
        border: "1.5px solid rgba(197,168,255,0.35)",
        borderRadius: 14, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 20,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>✦</span>
      <span style={{ flex: 1, fontSize: 13, color: "#D4BAFF", lineHeight: 1.5 }}>{text}</span>
      {onRun && (
        <button
          onClick={onRun}
          disabled={running}
          style={aiBtnStyle()}
        >
          {running ? <Loader2 size={12} className="animate-spin" /> : "✦"}
          {running ? "Running…" : "Run agent"}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle = {
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

function formatRelative(date) {
  if (!date) return "";
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)  return "just now";
  if (diff < 120) return "1 min ago";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}