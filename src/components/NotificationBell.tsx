"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setNotifications(data);
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      await fetch("/api/notifications", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="通知"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">通知</p>
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  await fetch("/api/notifications", { method: "PUT" });
                  setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                すべて既読
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">通知はありません</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.link}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50/60" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">
                        {n.type === "comment" ? "💬" : n.type === "reply" ? "↩️" : n.type === "new_video" ? "🎬" : n.type === "mention" ? "📣" : "❤️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(n.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0" />}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
