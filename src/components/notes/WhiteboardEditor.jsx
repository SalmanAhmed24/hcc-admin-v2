/**
 * ============================================================
 * WHITEBOARD EDITOR — components/notes/WhiteboardEditor.jsx
 * ============================================================
 *
 * Embeds Excalidraw as the infinite whiteboard canvas.
 *
 * WHY DYNAMIC IMPORT?
 *   Excalidraw uses browser APIs that are not available during
 *   Next.js SSR. We must import it with { ssr: false }.
 *
 * INSTALL:
 *   npm install @excalidraw/excalidraw --legacy-peer-deps
 *
 * DATA FLOW:
 *   Load:   note.whiteboardContent → initialData → Excalidraw
 *   Save:   Excalidraw onChange → parent.onChange() → auto-save
 *
 * PROPS:
 *   content    {Object}   Excalidraw scene data from DB (or null)
 *   onChange   {Function} Called with new scene data on every change
 *   editable   {boolean}  Read-only mode flag
 * ============================================================
 */

"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useMemo } from "react";
import "@excalidraw/excalidraw/index.css";

// ─────────────────────────────────────────────
// DYNAMIC IMPORT — no SSR
// Excalidraw must be loaded client-side only.
// ─────────────────────────────────────────────
const Excalidraw = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "#0c0f18" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "#1e2538", borderTopColor: "#d97706" }}
          />
          <span style={{ color: "#334155", fontSize: "13px" }}>
            Loading canvas…
          </span>
        </div>
      </div>
    ),
  }
);

// ─────────────────────────────────────────────
// EXCALIDRAW THEME OVERRIDES
// Override Excalidraw CSS variables to match our dark slate theme.
// ─────────────────────────────────────────────
const EXCALIDRAW_THEME_CSS = `
  .excalidraw {
    --color-primary: #d97706;
    --color-primary-darker: #b45309;
    --color-primary-darkest: #92400e;
    --color-primary-light: #d9770630;
  }

  .excalidraw .Island {
    background: #111520 !important;
    border: 1px solid #1e2538 !important;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5) !important;
  }

  .excalidraw button:hover {
    background: #1e2538 !important;
  }

  .excalidraw .layer-ui__wrapper {
    font-family: 'DM Sans', system-ui, sans-serif !important;
  }

  /* Hide the footer "made with Excalidraw" link */
  .excalidraw .layer-ui__wrapper__footer-center {
    display: none !important;
  }
`;

// ─────────────────────────────────────────────
// WHITEBOARD EDITOR
// ─────────────────────────────────────────────
export default function WhiteboardEditor({
  content,
  onChange,
  editable = true,
}) {
  // Debounce timer ref
  const debounceTimer = useRef(null);

  // Excalidraw API ref (gives access to imperative methods)
  const excalidrawApiRef = useRef(null);

  // ─── Initial data ───────────────────────────
  // Parse saved content into Excalidraw's initialData format.
  // We memoize this so it only runs once on mount.
  const initialData = useMemo(() => {
    if (!content) return null;

    try {
      // content should be: { elements, appState, files }
      // This matches the shape returned by our onChange handler below.
      return {
        elements: content.elements ?? [],
        appState: {
          ...(content.appState ?? {}),
          // Always force dark theme regardless of saved state
          theme: "dark",
          // Restore viewport if saved, otherwise center it
          viewBackgroundColor: "#0c0f18",
        },
        files: content.files ?? {},
      };
    } catch (error) {
      console.error("Failed to parse whiteboard content:", error);
      return null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ intentionally empty — we only want to compute initialData once on mount

  // ─── onChange handler ───────────────────────
  // Called by Excalidraw on every element/state change.
  // We debounce it to avoid hammering the parent's save logic.
  const handleChange = useCallback(
    (elements, appState, files) => {
      if (!onChange || !editable) return;

      // Clear previous debounce
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        // Save the full scene snapshot
        // Strip non-serializable appState keys to keep the payload lean
        const {
          collaborators, // Map — not serializable
          openMenu,
          openPopup,
          openDialog,
          openSidebar,
          ...serializableAppState
        } = appState;

        onChange({
          elements,
          appState: serializableAppState,
          files,
        });
      }, 800); // 800ms debounce — matches Tldraw version
    },
    [onChange, editable]
  );

  // ─── Excalidraw API ref callback ────────────
  const handleApiRef = useCallback((api) => {
    excalidrawApiRef.current = api;
  }, []);

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        background: "#0c0f18",
        height: "100%",   // ← required! Excalidraw needs an explicit height
        width: "100%",
      }}
    >
      {/* Inject theme CSS overrides */}
      <style>{EXCALIDRAW_THEME_CSS}</style>

      <Excalidraw
        // ── Core props ──────────────────────────
        excalidrawAPI={handleApiRef}
        initialData={initialData}
        onChange={handleChange}

        // ── Theme ───────────────────────────────
        theme="dark"

        // ── UI options ──────────────────────────
        UIOptions={{
          canvasActions: {
            // Show/hide canvas-level actions in the menu
            saveToActiveFile: false,  // We handle saving ourselves
            saveAsImage: true,
            loadScene: false,         // Prevent loading external files
            export: { saveFileToDisk: true },
          },
        }}

        // ── Read-only mode ──────────────────────
        viewModeEnabled={!editable}

        // ── Misc ────────────────────────────────
        autoFocus={true}
        detectScroll={false}       // Avoid conflicts with parent scroll
        handleKeyboardGlobally={false}
      />
    </div>
  );
}