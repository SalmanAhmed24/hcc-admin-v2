"use client";
import { useRef } from "react";
import { useNotifications } from "../contexts/NotificationContext";

const Notifications = ({ drawer = false }) => {
  const {
    notifications = [],
    unreadCount = 0,
    markAllAsRead,
    markAsRead,
    loadMore,
    hasMore,
    loadingMore,
  } = useNotifications();
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !hasMore || loadingMore) return;

    const threshold = 150; // px before bottom

    if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {
      loadMore();
    }
  };

  return (
    <div
      className={`
    flex-1 min-w-0
    ${drawer ? "h-full" : notifications.length > 0 ? "h-[600px] max-h-[600px]" : "h-[150px]"}
    flex flex-col
    rounded-[18px]
    border border-[rgba(127,86,217,0.22)]
    bg-[rgba(28,22,52,0.85)]
    overflow-hidden
  `}
    >
      {/* ================= HEADER ================= */}
      <div
        className="
          flex items-center justify-between
          px-5 py-4
          border-b border-[rgba(127,86,217,0.18)]
          bg-[rgba(69,44,149,0.12)]
        "
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#6F618F]">
            Notifications
          </p>
          <p className="text-lg text-[#B797FF] font-semibold">
            {unreadCount} Unread
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="
            text-xs px-3 py-1.5
            rounded-[10px]
            border border-[rgba(183,151,255,0.3)]
            text-[#B797FF]
            hover:bg-[rgba(183,151,255,0.1)]
            transition
          "
        >
          Mark All Read
        </button>
      </div>

      {/* ================= BODY ================= */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {notifications.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#6F618F] text-sm">
            No notifications
          </div>
        ) : (
          notifications.map((n, index) => {
            return (
              <div
                key={index}
                onClick={() => {
                  if (n.status === "UNREAD") {
                    markAsRead(n._id ?? n.id);
                  }
                }}
                className={`
                px-5 py-4
                border-b border-[rgba(127,86,217,0.08)]
                transition cursor-pointer
                hover:bg-[rgba(183,151,255,0.08)]
                ${n.status === "UNREAD" ? "bg-[rgba(183,151,255,0.05)]" : ""}
              `}
              >
                {/* TITLE + PRIORITY + UNREAD DOT */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2">
                    {/*  UNREAD DOT */}
                    {n.status === "UNREAD" && (
                      <span className="w-2 h-2 rounded-full bg-[#B797FF]" />
                    )}

                    <p className="text-sm font-medium text-[#EAE6FF]">
                      {n.title}
                    </p>
                  </div>

                  {n.priority && (
                    <span
                      className={`
                      text-[10px] px-2 py-0.5 rounded-md border
                      ${
                        n.priority === "Urgent"
                          ? "text-red-400 border-red-400/30"
                          : n.priority === "High"
                            ? "text-yellow-400 border-yellow-400/30"
                            : "text-green-400 border-green-400/30"
                      }
                    `}
                    >
                      {n.priority}
                    </span>
                  )}
                </div>

                {/* MESSAGE */}
                <p className="text-xs text-[#A99BD4] mt-1 leading-relaxed">
                  {n.message}
                </p>

                {/* TIME */}
                <p className="text-[10px] text-[#6F618F] mt-2">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
        {loadingMore && (
          <div className="text-center text-xs text-[#6F618F] py-2">
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
