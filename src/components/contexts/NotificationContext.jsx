"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import Swal from "sweetalert2";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within provider");
  return ctx;
};

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);

  const { toast } = useToast();

  const eventSourceRef = useRef(null);
  const tabId = useRef(null);
  const pathname = usePathname();
  // =========================
  // INIT TAB ID (FIXED)
  // =========================
  useEffect(() => {
    if (typeof window !== "undefined") {
      let existing = sessionStorage.getItem("tab_id");

      if (!existing) {
        existing = `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem("tab_id", existing);
      }

      tabId.current = existing;
    }
  }, []);

  // =========================
  // FETCH SSE TOKEN
  // =========================
  const fetchSseToken = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sse-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userId}`,
          },
          cache: "no-store",
        },
      );

      const data = await res.json();
      return data.success ? data.sseToken : null;
    } catch (err) {
      console.error("SSE token error:", err);
      return null;
    }
  };

  // =========================
  // FETCH NOTIFICATIONS
  // =========================
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${userId}`,
      );

      const data = await res.json();
      setNotifications(data.data || []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  }, [userId]);

  // =========================
  // MARK SINGLE AS READ ✅
  // =========================
  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id || n.id === id ? { ...n, status: "READ" } : n,
        ),
      );

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`,
        {
          method: "PATCH",
        },
      );
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  };

  // =========================
  // MARK ALL AS READ
  // =========================
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${userId}/readAll`,
        {
          method: "PATCH",
        },
      );
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  };

  // =========================
  // SSE CONNECTION
  // =========================
  const connectSSE = useCallback(async () => {
    if (!userId || !tabId.current) return;

    const token = await fetchSseToken();
    if (!token) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/subscribe/${userId}?sseToken=${token}&tabId=${tabId.current}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setSseConnected(true);
      console.log("SSE connected");
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected" || data.type === "ping") return;

        if (data.type && data.message) {
          const newNotification = {
            id: data.id,
            type: data.type,
            title: data.title,
            message: data.message,
            status: "UNREAD",
            createdAt: data.createdAt,
            priority: data.priority,
          };

          setNotifications((prev) => {
            const exists = prev.some(
              (n) =>
                n.id === newNotification.id || n._id === newNotification.id,
            );
            if (exists) return prev;
            return [newNotification, ...prev];
          });

          toast({
            title: `${newNotification.title}`,
            description: `${newNotification.message}`,
          });
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    es.onerror = () => {
      setSseConnected(false);
      es.close();

      setTimeout(() => {
        connectSSE();
      }, 3000);
    };
  }, [userId]);
  console.log("Notifications:", notifications);
  // =========================
  // INIT
  // =========================
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [userId, fetchNotifications, connectSSE]);

  // =========================
  // UNREAD COUNT
  // =========================
  useEffect(() => {
    const count = notifications.filter((n) => n.status === "UNREAD").length;
    setUnreadCount(count);
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        sseConnected,
        refresh: fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
