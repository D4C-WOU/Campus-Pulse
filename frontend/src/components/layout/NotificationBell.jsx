"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/services/notificationService";

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {

    loadNotifications();

    const interval = setInterval(loadNotifications, 10000);

    return () => clearInterval(interval);

  }, []);

  async function loadNotifications() {
    const data = await getNotifications();
    setNotifications(data);
  }

  const unread = notifications.filter(n => !n.is_read).length;

  async function handleRead(id) {
    await markNotificationRead(id);
    loadNotifications();
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    loadNotifications();
  }

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell size={20} />

        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"
          />
        )}

      </button>

      {open && (

        <div className="absolute right-0 mt-3 w-80 rounded-xl border bg-background shadow-lg">

          <div className="flex items-center justify-between p-3 border-b">

            <h3 className="font-medium">
              Notifications
            </h3>

            <button
              onClick={handleReadAll}
              className="text-xs text-blue-500"
            >
              Mark all read
            </button>

          </div>

          <div className="max-h-96 overflow-y-auto">

            {notifications.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                No notifications
              </p>
            )}

            {notifications.map(n => (

              <div
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`cursor-pointer border-b p-3 ${!n.is_read ? "bg-blue-50 dark:bg-blue-950" : ""
                  }`}
              >

                <p className="font-medium">
                  {n.title}
                </p>

                <p className="text-sm text-muted-foreground">
                  {n.message}
                </p>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );
}