/**
 * ============================================================
 * NOTE EDITOR PAGE — app/[entityType]/[entityId]/notes/[noteId]/page.jsx
 * ============================================================
 *
 * Wraps the NoteEditor component for EXISTING notes.
 * The [noteId] param can be "new" for creating a new note.
 *
 * ROUTE:
 *   /contact/64a1b/notes/64xyz   → edit existing
 *   /contact/64a1b/notes/new     → create new
 * ============================================================
 */

"use client";

import { useParams } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";
import useAuthStore from "@/store/store";

// ─────────────────────────────────────────────
// NOTE: Replace this with however your app exposes
// the current authenticated user's ID.
// e.g. from a session cookie, auth context, or JWT decode.
// ─────────────────────────────────────────────
// const useCurrentUserId = () => {
//   // Placeholder — replace with your auth hook/context
//   if (typeof window === "undefined") return null;
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) return null;
//     // Decode JWT payload (base64) to extract user id
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     return payload.id || payload.sub || null;
//   } catch {
//     return null;
//   }
// };




export default function NoteEditorPage() {
  const params = useParams();
  const { entityType, entityId, noteId } = params;
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.user?._id || null; // Replace with your auth store selector
  // "new" is the special param for creating a note
  const isNew = noteId === "new";

  return (
    <NoteEditor
      noteId={isNew ? null : noteId}
      entityId={entityId}
      entityType={entityType}
      currentUserId={currentUserId}
    />
  );
}