/**
 * ============================================================
 * useVoiceRecorder — hooks/useVoiceRecorder.js
 * ============================================================
 *
 * Wraps the browser's Web Speech Recognition API for real-time
 * speech-to-text transcription directly into the Tiptap editor.
 *
 * WHAT THIS DOES:
 *   - Listens to the microphone via SpeechRecognition
 *   - Streams interim (in-progress) text live as the user speaks
 *   - Accumulates final (confirmed) sentences as the user pauses
 *   - On stop: calls onTranscript(finalText) for the parent to
 *     insert the text into the Tiptap editor at the cursor
 *
 * WHAT THIS DOES NOT DO:
 *   - No audio file is saved (transcription only, per spec)
 *   - No backend calls — runs 100% in the browser
 *   - Does not auto-save — the parent's existing autoSave triggers
 *     from the editor's onChange after text is inserted
 *
 * BROWSER SUPPORT:
 *   Chrome ✅  Edge ✅  Safari ✅  Firefox ❌ (no implementation)
 *   We expose hasSupport so the UI can hide the button on Firefox.
 *
 * WEB SPEECH API QUIRKS:
 *   - continuous: true  → keeps listening across natural pauses
 *   - interimResults: true → fires during speech, not just at pauses
 *   - onend fires after silence — we restart it while still "recording"
 *     because the API stops itself after ~60s of continuous use on Chrome
 *   - Each onresult event only contains NEW results from resultIndex
 *     forward — we must accumulate across events ourselves
 *
 * EXPORTED INTERFACE:
 *   isRecording       {boolean}
 *   interimTranscript {string}   live in-progress words (shown in grey)
 *   finalTranscript   {string}   confirmed sentences so far
 *   error             {string|null}
 *   hasSupport        {boolean}
 *   start()           → requests mic + starts recognition
 *   stop()            → ends recognition, fires onTranscript callback
 *   reset()           → clears transcript state (call after insertion)
 * ============================================================
 */

import { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────
// SUPPORT DETECTION
// NOT run at module load — only checked client-side after mount.
// Running window checks at module scope causes SSR/client mismatches.
// ─────────────────────────────────────────────
const getSpeechSupport = () => {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────
export const useVoiceRecorder = ({
  onTranscript, // (text: string) => void — called when recording stops
  language = "en-US",
} = {}) => {
  // hasSupport starts false on both server and client (avoids hydration mismatch),
  // then flips to the real value after mount when window is available.
  const [hasSupport, setHasSupport] = useState(false);

  useEffect(() => {
    setHasSupport(getSpeechSupport());
  }, []);

  // ── STATE ───────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState(null);

  // ── REFS ────────────────────────────────────
  // recognitionRef  → the live SpeechRecognition instance
  // accumulatedRef  → mirror of finalTranscript for use inside callbacks
  //                   (state reads inside event handlers are stale closures;
  //                    refs always read the current value)
  // isRecordingRef  → same pattern for isRecording
  const recognitionRef = useRef(null);
  const accumulatedRef = useRef("");
  const isRecordingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    accumulatedRef.current = finalTranscript;
  }, [finalTranscript]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // ── CLEANUP ─────────────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // ── BUILD RECOGNITION INSTANCE ───────────────
  const buildRecognition = useCallback(() => {
    // Read window fresh here — this only ever runs client-side inside a callback
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const recognition = new SR();

    // continuous: true — keeps listening after natural speech pauses.
    // Without this the API stops after the first detected sentence.
    recognition.continuous = true;

    // interimResults: true — fires onresult with partial words while
    // the user is still speaking. This gives the live ghost-text effect.
    recognition.interimResults = true;

    recognition.lang = language;
    recognition.maxAlternatives = 1;

    // ── onresult ───────────────────────────────
    // Fires on every new piece of speech — interim or final.
    // We iterate from event.resultIndex to skip already-processed results.
    recognition.onresult = (event) => {
      let interim = "";
      let newFinalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Confirmed sentence — append a space so words don't run together
          newFinalChunk += text + " ";
        } else {
          // Still speaking — show as live preview
          interim = text;
        }
      }

      if (newFinalChunk) {
        const updated = accumulatedRef.current + newFinalChunk;
        setFinalTranscript(updated);
        // accumulatedRef stays in sync via the useEffect above
      }

      setInterimTranscript(interim);
    };

    // ── onerror ────────────────────────────────
    recognition.onerror = (event) => {
      // "no-speech" → silence detected, not a real error, ignore
      // "aborted"   → we called .abort() ourselves, ignore
      if (event.error === "no-speech" || event.error === "aborted") return;

      console.error("[useVoiceRecorder] Recognition error:", event.error);

      const messages = {
        "not-allowed":
          "Microphone permission denied. Allow mic access in your browser settings and try again.",
        "network":
          "Network error during transcription. Check your connection.",
        "audio-capture":
          "No microphone found. Please connect a microphone and try again.",
        "service-not-allowed":
          "Speech recognition is not allowed in this context.",
      };

      setError(messages[event.error] || `Recognition error: ${event.error}`);
      setIsRecording(false);
    };

    // ── onend ──────────────────────────────────
    // The Web Speech API has a built-in timeout (~60s on Chrome) and also
    // stops itself after a long silence. If we're still meant to be
    // recording, restart it automatically so the user doesn't notice.
    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch {
          // May throw "already started" — safe to ignore
        }
      }
    };

    return recognition;
  }, [SpeechRecognition, language]);

  // ── START ───────────────────────────────────

  /**
   * start
   * Clears previous state and starts speech recognition.
   * The browser will prompt for microphone permission if not yet granted.
   */
  const start = useCallback(() => {
    if (!hasSupport) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    // Clear previous session
    setError(null);
    setInterimTranscript("");
    setFinalTranscript("");
    accumulatedRef.current = "";

    const recognition = buildRecognition();
    if (!recognition) return;

    try {
      recognition.start();
      recognitionRef.current = recognition;
      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (err) {
      setError(`Could not start microphone: ${err.message}`);
    }
  }, [hasSupport, buildRecognition]);

  // ── STOP ────────────────────────────────────

  /**
   * stop
   * Ends the recognition session and fires onTranscript with the
   * accumulated final text so NoteEditor can insert it into Tiptap.
   */
  const stop = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setInterimTranscript("");

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    const text = accumulatedRef.current.trim();
    if (text) {
      onTranscript?.(text);
    }
  }, [onTranscript]);

  // ── RESET ───────────────────────────────────
  // Call this after the transcript has been inserted into the editor
  // so state is clean for the next recording session.
  const reset = useCallback(() => {
    setInterimTranscript("");
    setFinalTranscript("");
    setError(null);
    accumulatedRef.current = "";
  }, []);

  return {
    isRecording,
    interimTranscript,
    finalTranscript,
    error,
    hasSupport,
    start,
    stop,
    reset,
  };
};