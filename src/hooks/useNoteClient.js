"use client";

import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import apiClient from "@/lib/apiClient";
import { apiPath } from "@/utils/routes";

const BASE = apiPath.prodPath;

// ─── SWR hooks ────────────────────────────────────────────────────────────────

/**
 * Fetch notes linked to a specific client (paginated).
 */
export function useNotesByClient(clientId, page = 1, limit = 20) {
  const key = clientId
    ? `/notes/by-client/${clientId}?page=${page}&limit=${limit}`
    : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3000,
  });
  return {
    notes: data?.data || [],
    pagination: data?.pagination || { total: 0, page: 1, limit, totalPages: 1 },
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Fetch connected-client info for a single note.
 */
export function useNoteClientInfo(noteId) {
  const key = noteId ? `/notes/${noteId}/client-info` : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });
  return {
    connected: data?.data?.connected || false,
    client: data?.data?.client || null,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Search clients for note linking (paginated).
 */
export function useSearchClientsForNote(query, page = 1, limit = 5) {
  const q = query?.trim() || "";
  const key = `/notes/search-clients?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
  const { data, error, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 500,
  });
  return {
    clients: data?.data || [],
    pagination: data?.pagination || { total: 0, page: 1, limit, totalPages: 1 },
    isLoading,
    isError: error,
  };
}

// ─── Mutation helpers ────────────────────────────────────────────────────────

/**
 * Connect a note to a client.
 */
export async function connectNoteToClient(noteId, clientId) {
  const { data } = await apiClient.patch(
    `${BASE}/api/notes/${noteId}/connect-client`,
    { clientId }
  );
  return data;
}

/**
 * Disconnect a note from its client.
 */
export async function disconnectNoteFromClient(noteId) {
  const { data } = await apiClient.patch(
    `${BASE}/api/notes/${noteId}/disconnect-client`
  );
  return data;
}

/**
 * Create a note pre-linked to a client.
 */
export async function addNoteFromClient(clientId, noteData) {
  const fd = new FormData();
  if (noteData.title) fd.append("title", noteData.title);
  if (noteData.userId) fd.append("userId", noteData.userId);
  if (noteData.richTextContent)
    fd.append("richTextContent", JSON.stringify(noteData.richTextContent));
  if (noteData.whiteboardContent)
    fd.append("whiteboardContent", JSON.stringify(noteData.whiteboardContent));
  if (noteData.tags) fd.append("tags", JSON.stringify(noteData.tags));

  const { data } = await apiClient.post(
    `${BASE}/api/notes/from-client/${clientId}`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/**
 * Delete a note by ID.
 */
export async function deleteNoteById(noteId) {
  await apiClient.delete(`${BASE}/api/notes/${noteId}`);
}

/**
 * Update note pin/archive status.
 */
export async function updateNoteStatus(noteId, updates) {
  const fd = new FormData();
  if (updates.isPinned !== undefined) fd.append("isPinned", String(updates.isPinned));
  if (updates.isArchived !== undefined) fd.append("isArchived", String(updates.isArchived));
  if (updates.userId) fd.append("userId", updates.userId);

  const { data } = await apiClient.put(`${BASE}/api/notes/${noteId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
