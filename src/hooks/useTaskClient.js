"use client";

import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import apiClient from "@/lib/apiClient";
import { apiPath } from "@/utils/routes";

const BASE = apiPath.prodPath;

// ─── SWR hooks ────────────────────────────────────────────────────────────────

/**
 * Fetch tasks linked to a specific client (paginated).
 */
export function useTasksByClient(clientId, page = 1, limit = 10) {
  const key = clientId
    ? `/tasks/by-client/${clientId}?page=${page}&limit=${limit}`
    : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3000,
  });
  return {
    tasks: data?.tasks || [],
    pagination: data?.pagination || { total: 0, page: 1, limit, totalPages: 1 },
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Fetch the connected client info for a task.
 */
export function useTaskClientInfo(taskId) {
  const key = taskId ? `/tasks/${taskId}/client-info` : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });
  return {
    connected: data?.connected || false,
    client: data?.client || null,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Search clients for connecting to a task (paginated).
 */
export function useSearchClientsForLink(query, page = 1, limit = 5) {
  const key = `/tasks/search-clients?q=${encodeURIComponent(query || "")}&page=${page}&limit=${limit}`;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 500,
    keepPreviousData: true,
  });
  return {
    clients: data?.clients || [],
    pagination: data?.pagination || { total: 0, page: 1, limit, totalPages: 1 },
    isLoading,
    isError: error,
    mutate,
  };
}

// ─── Mutation helpers ─────────────────────────────────────────────────────────

/**
 * Connect a task to a client.
 */
export async function connectTaskToClient(taskId, clientId) {
  const res = await apiClient.patch(
    `${BASE}/api/tasks/${taskId}/connect-client`,
    { clientId },
  );
  return res.data;
}

/**
 * Disconnect a task from its client.
 */
export async function disconnectTaskFromClient(taskId) {
  const res = await apiClient.patch(
    `${BASE}/api/tasks/${taskId}/disconnect-client`,
  );
  return res.data;
}

/**
 * Create a task from within a client context.
 */
export async function addTaskFromClient(clientId, taskData) {
  const res = await apiClient.post(
    `${BASE}/api/tasks/from-client/${clientId}`,
    taskData,
  );
  return res.data;
}

/**
 * Assign a task to users.
 */
export async function assignTaskToUsers(taskId, assignedTo) {
  const res = await apiClient.patch(
    `${BASE}/api/tasks/${taskId}/assign`,
    { assignedTo },
  );
  return res.data;
}

/**
 * Delete a task.
 */
export async function deleteTaskById(taskId) {
  const res = await apiClient.delete(`${BASE}/api/tasks/${taskId}`);
  return res.data;
}

/**
 * Update task status.
 */
export async function updateTaskStatus(taskId, taskStatus) {
  const updateData = { taskStatus };
  if (taskStatus === "Completed") updateData.completedDate = new Date();
  const res = await apiClient.patch(
    `${BASE}/api/tasks/${taskId}/status`,
    updateData,
  );
  return res.data;
}
