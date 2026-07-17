"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/services/notificationService";
import { formatRelativeTime } from "@/lib/utils";
import { useAlertsSocket } from "@/hooks/useAlertsSocket";
import { cn } from "@/lib/utils";

const TYPE_COLORS = {
  alert_created: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]",
  alert_resolved: "bg-[hsl(var(--status-resolved-bg))] text-[hsl(var(--status-resolved))]",
  false_report: "bg-[hsl(var(--status-false-bg))] text-[hsl(var(--status-false))]",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useAlertsSocket((event, data) => {
    if (event === "NEW_NOTIFICATION") {
      setNotifications((prev) => [data, ...prev]);
    }
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // silently fail — the bell shouldn't break the whole shell
    }
  }

  const unread = notifications.filter((n) => !n.is_read).length;

  async function handleRead(id) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--status-active))] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unread > 0 && (
                <span className="rounded-full bg-[hsl(var(--status-active-bg))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--status-active))]">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={handleReadAll}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                  title="Mark all read"
                >
                  <CheckCheck className="size-3.5" />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 divide-y divide-border-subtle overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleRead(n.id)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated",
                  !n.is_read && "bg-[hsl(var(--status-investigating-bg))]"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    {!n.is_read && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--status-investigating))]" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRead(n.id);
                    }}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                    title="Mark read"
                  >
                    <Check className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-border-subtle px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">
                {notifications.length} total • {unread} unread
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}