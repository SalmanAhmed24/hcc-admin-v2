/**
 * ============================================================
 * VOICE RECORDER — components/notes/VoiceRecorder.jsx
 * ============================================================
 *
 * The UI layer for voice-to-text. Renders two things:
 *
 *  1. MIC BUTTON — sits in the NoteEditor top toolbar.
 *     - Idle: grey mic icon
 *     - Recording: red, pulsing, shows elapsed seconds
 *     - No support (Firefox): hidden entirely
 *
 *  2. TRANSCRIPT PILL — floats above the editor while recording.
 *     - Shows live interim text in muted colour (still speaking)
 *     - Shows accumulated final text in white (confirmed sentences)
 *     - "Insert" button → inserts final text into editor immediately
 *       without stopping the recording (useful for long dictations)
 *     - Dismisses automatically when recording stops
 *
 * PROPS:
 *   onTranscript  {Function}  (text: string) => void
 *                 Called by the hook when recording stops OR when
 *                 the user clicks Insert mid-session. NoteEditor
 *                 receives this and inserts text into the Tiptap editor.
 *
 *   disabled      {boolean}   Disables mic button (e.g. in whiteboard mode)
 *
 * DESIGN NOTES:
 *   - Tablet-first: button is 36×36px minimum touch target
 *   - Pill is non-blocking: user can still type/scroll behind it
 *   - Recording indicator matches the amber accent used throughout
 *     the rest of the editor (consistent with Save button active state)
 *   - Error toast auto-dismisses after 5 seconds
 * ============================================================
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Square, X, CornerDownLeft } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

// ─────────────────────────────────────────────
// KEYFRAME INJECTION
// Injected once into <head> via useEffect — never as an inline
// <style> tag in JSX. An inline <style> in the component body
// renders on the server but its sibling elements (the button)
// are conditionally hidden until after mount, causing a
// server/client HTML mismatch and a hydration error.
// ─────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes voice-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.85); }
  }
  @keyframes voice-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.9); opacity: 0;   }
  }
`;

const useKeyframes = () => {
  useEffect(() => {
    const id = "voice-recorder-keyframes";
    if (document.getElementById(id)) return; // already injected
    const style = document.createElement("style");
    style.id = id;
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    // No cleanup — keyframes are global and reused across remounts
  }, []);
};
// Pure CSS animation — no extra library needed
// ─────────────────────────────────────────────
const PulsingDot = () => (
  <span
    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
    style={{
      background: "#ef4444",
      animation: "voice-pulse 1.2s ease-in-out infinite",
    }}
  />
);

// ─────────────────────────────────────────────
// ELAPSED TIMER
// Simple seconds counter — we track it locally in the component
// because the hook doesn't need to know about display time.
// ─────────────────────────────────────────────
const useElapsed = (isRecording) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatted = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return formatted;
};

// ─────────────────────────────────────────────
// LIVE TRANSCRIPT PILL
// Appears above the editor while recording.
// Shows interim text (greyed out) + confirmed final text (white).
// ─────────────────────────────────────────────
const TranscriptPill = ({
  interimTranscript,
  finalTranscript,
  onInsertNow,
  onDismiss,
}) => {
  const hasText = finalTranscript || interimTranscript;
  const pillRef = useRef(null);

  // Auto-scroll inside the pill when text gets long
  useEffect(() => {
    if (pillRef.current) {
      pillRef.current.scrollTop = pillRef.current.scrollHeight;
    }
  }, [interimTranscript, finalTranscript]);

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-50 flex flex-col"
      style={{
        bottom: "calc(100% + 12px)", // floats above the toolbar's bottom edge
        width: "min(520px, 90vw)",
        background: "#111827",
        border: "1px solid #1e2d40",
        borderRadius: "14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,119,6,0.1)",
      }}
    >
      {/* Pill header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid #1a2538" }}
      >
        <PulsingDot />
        <span className="text-xs font-semibold flex-1" style={{ color: "#64748b" }}>
          Listening… speak naturally
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded transition-colors hover:bg-white/5"
          style={{ color: "#334155" }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Transcript text */}
      <div
        ref={pillRef}
        className="px-4 py-3 overflow-y-auto"
        style={{ maxHeight: 140, minHeight: 48 }}
      >
        {!hasText ? (
          <p className="text-sm" style={{ color: "#1e2d40", fontStyle: "italic" }}>
            Start speaking…
          </p>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            {/* Confirmed text — brighter */}
            {finalTranscript && (
              <span style={{ color: "#cbd5e1" }}>{finalTranscript}</span>
            )}
            {/* Interim (in-progress) — muted, italic */}
            {interimTranscript && (
              <span
                style={{ color: "#475569", fontStyle: "italic" }}
              >
                {interimTranscript}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Actions */}
      {finalTranscript && (
        <div
          className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{ borderTop: "1px solid #1a2538" }}
        >
          <p className="text-xs" style={{ color: "#334155" }}>
            ⌘↵ to insert without stopping
          </p>
          <button
            type="button"
            onClick={onInsertNow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: "#d9770620",
              border: "1px solid #d9770640",
              color: "#d97706",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d9770630";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#d9770620";
            }}
          >
            <CornerDownLeft size={12} />
            Insert now
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// ERROR TOAST
// Appears below the mic button, auto-dismisses after 5s.
// ─────────────────────────────────────────────
const ErrorToast = ({ message, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
      style={{
        background: "#2d0f0f",
        border: "1px solid #7f1d1d",
        color: "#fca5a5",
        maxWidth: 280,
        whiteSpace: "normal",
        lineHeight: 1.5,
      }}
    >
      <MicOff size={13} style={{ flexShrink: 0, marginTop: 1 }} />
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} style={{ color: "#f87171" }}>
        <X size={12} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// VOICE RECORDER (MAIN EXPORT)
// ─────────────────────────────────────────────

/**
 * VoiceRecorder
 * Renders the mic button for the NoteEditor top toolbar.
 * Manages the TranscriptPill and ErrorToast as absolute-positioned
 * children (anchored to the button's nearest positioned ancestor —
 * the toolbar's right-side action group).
 *
 * @param {Function} onTranscript  (text) => void
 * @param {boolean}  disabled      hides/disables when in whiteboard mode
 */
export default function VoiceRecorder({ onTranscript, disabled = false }) {
  // Inject keyframe CSS into <head> once, client-side only
  useKeyframes();

  // Whether the pill is explicitly dismissed mid-session
  const [pillDismissed, setPillDismissed] = useState(false);
  const elapsed = useElapsed(false); // we re-wire below after hook

  const {
    isRecording,
    interimTranscript,
    finalTranscript,
    error,
    hasSupport,
    start,
    stop,
    reset,
  } = useVoiceRecorder({
    onTranscript: (text) => {
      onTranscript?.(text);
      reset();
      setPillDismissed(false);
    },
  });

  // Re-create elapsed with the live isRecording value
  const elapsedDisplay = useElapsed(isRecording);

  // Keyboard shortcut: ⌘Enter → insert current transcript without stopping
  useEffect(() => {
    if (!isRecording) return;
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleInsertNow();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRecording, finalTranscript]);

  // Re-show the pill if new text comes in after it was dismissed
  useEffect(() => {
    if (finalTranscript || interimTranscript) {
      setPillDismissed(false);
    }
  }, [finalTranscript, interimTranscript]);

  const handleToggle = () => {
    if (isRecording) {
      stop();
    } else {
      setPillDismissed(false);
      start();
    }
  };

  // Insert current final text into editor without stopping the recording.
  // Useful mid-dictation if the user wants to break the text into chunks.
  const handleInsertNow = () => {
    if (!finalTranscript.trim()) return;
    onTranscript?.(finalTranscript.trim());
    // Clear just the accumulated text — keep recording
    reset();
  };

  // hasSupport is false on the server and stays false until the mount
  // useEffect runs client-side. Both renders return null initially,
  // so there is no server/client HTML mismatch.
  // After mount, if the browser supports SpeechRecognition, the button appears.
  if (!hasSupport) return null;

  const showPill =
    isRecording &&
    !pillDismissed &&
    (interimTranscript || finalTranscript);

  return (
    <div className="relative flex items-center">

        {/* ── MIC BUTTON ─────────────────────────── */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          title={isRecording ? "Stop recording (⌘Space)" : "Start voice recording (⌘Space)"}
          className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: isRecording ? "#7f1d1d" : "transparent",
            border: `1px solid ${isRecording ? "#ef444460" : "transparent"}`,
            color: isRecording ? "#f87171" : disabled ? "#1e2538" : "#475569",
            cursor: disabled ? "not-allowed" : "pointer",
            minWidth: isRecording ? 72 : 36,
            height: 36,
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isRecording && !disabled) {
              e.currentTarget.style.background = "#ffffff08";
              e.currentTarget.style.color = "#94a3b8";
            }
          }}
          onMouseLeave={(e) => {
            if (!isRecording && !disabled) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#475569";
            }
          }}
        >
          {/* Ripple ring — only while recording */}
          {isRecording && (
            <span
              className="absolute inset-0 rounded-lg"
              style={{
                border: "1px solid #ef4444",
                animation: "voice-ring 1.5s ease-out infinite",
                pointerEvents: "none",
              }}
            />
          )}

          {isRecording ? (
            <>
              <Square size={13} style={{ fill: "#f87171" }} />
              <span className="text-xs font-mono">{elapsedDisplay}</span>
              <PulsingDot />
            </>
          ) : (
            <Mic size={15} />
          )}
        </button>

        {/* ── TRANSCRIPT PILL ────────────────────── */}
        {showPill && (
          <TranscriptPill
            interimTranscript={interimTranscript}
            finalTranscript={finalTranscript}
            onInsertNow={handleInsertNow}
            onDismiss={() => setPillDismissed(true)}
          />
        )}

        {/* ── ERROR TOAST ────────────────────────── */}
        {error && (
          <ErrorToast message={error} onDismiss={() => {}} />
        )}
      </div>
  );
}