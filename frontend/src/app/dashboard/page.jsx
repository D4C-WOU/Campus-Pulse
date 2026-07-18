"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import { useAlertsSocket } from "@/hooks/useAlertsSocket";
import { getOverview } from "@/app/services/dashboardService";
import { getAlerts } from "@/app/services/alertService";
import { getNotifications } from "@/app/services/notificationService";
import { formatRelativeTime } from "@/lib/utils";
import { STATUS_META, PRIORITY_META } from "@/lib/alertMeta";
import {
  HeartPulse,
  ShieldAlert,
  Clock,
  TrendingUp,
  Flame,
  Activity,
  ArrowRight,
  Bell,
  MapPin,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  Fire: Flame,
  Medical: HeartPulse,
  Safety: ShieldAlert,
  Network: Activity,
};

function StatCard({ label, value, icon: Icon, accent, suffix, delta }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}22` }}
        >
          <Icon className="size-4" style={{ color: accent }} />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold text-foreground">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-semibold text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function RecentAlertRow({ alert }) {
  const status = STATUS_META[alert.status] || STATUS_META.active;
  const priority = PRIORITY_META[alert.priority];
  const TypeIcon = TYPE_ICONS[alert.type] || ShieldAlert;

  return (
    <div className="flex items-center gap-4 py-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `var(--priority-${alert.priority})22`,
        }}
      >
        <TypeIcon
          className="size-4"
          style={{ color: `var(--priority-${alert.priority})` }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{alert.type}</span>
          <span className={cn("text-xs", priority?.className)}>
            {priority?.label}
          </span>
        </div>
        {alert.location_hint && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {alert.location_hint}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            status.className
          )}
        >
          {status.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(alert.created_at)}
        </span>
      </div>
    </div>
  );
}

function NotificationRow({ notification }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-2.5",
        !notification.is_read && "bg-[hsl(var(--status-investigating-bg))]"
      )}
    >
      <Bell
        className={cn(
          "mt-0.5 size-3.5 shrink-0",
          notification.is_read
            ? "text-muted-foreground"
            : "text-[hsl(var(--status-investigating))]"
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{notification.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
      {!notification.is_read && (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--status-investigating))]" />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [ovData, alertsData, notifData] = await Promise.all([
        getOverview(),
        getAlerts(1, 5),
        getNotifications(),
      ]);
      setOverview(ovData);
      setRecentAlerts(alertsData.items ?? []);
      setNotifications((notifData ?? []).slice(0, 5));
    } catch {
      toast.error("Couldn't load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const { connected } = useAlertsSocket((event, data) => {
    fetchAll();
    if (event === "NEW_ALERT") {
      setRecentAlerts((prev) => {
        const exists = prev.some((a) => a.id === data.id);
        if (exists) return prev;
        return [data, ...prev].slice(0, 5);
      });
    }
    if (event === "NEW_NOTIFICATION") {
      setNotifications((prev) => [data, ...prev].slice(0, 5));
    }
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const activeCount = overview?.active_incidents ?? 0;

  return (
    <ProtectedRoute>
      <AppShell connected={connected}>
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Campus-wide incident overview, updated live.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs text-muted-foreground">
              <Radio
                className={cn(
                  "size-3.5",
                  connected
                    ? "text-[hsl(var(--status-resolved))]"
                    : "text-[hsl(var(--status-active))]"
                )}
              />
              {connected ? "Live" : "Reconnecting..."}
            </div>
          </div>

          {/* Live Urgency Banner */}
          {!loading && activeCount > 0 && (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[hsl(var(--status-active)/0.3)] bg-[hsl(var(--status-active-bg))] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--status-active))]">
                  <ShieldAlert className="size-4 text-white" />
                </span>
                <p className="text-sm font-semibold text-[hsl(var(--status-active))]">
                  {activeCount} active incident{activeCount !== 1 && "s"} require
                  attention
                </p>
              </div>
              <Link
                href="/alerts?status=active"
                className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--status-active))] hover:underline"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}

          {loading && (
            <div className="mt-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-surface-elevated"
                />
              ))}
            </div>
          )}

          {!loading && overview && (
            <>
              {/* Stat Cards */}
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                  label="Active"
                  value={overview.active_incidents}
                  icon={ShieldAlert}
                  accent="hsl(var(--status-active))"
                />
                <StatCard
                  label="Resolved"
                  value={overview.resolved_incidents}
                  icon={HeartPulse}
                  accent="hsl(var(--status-resolved))"
                />
                <StatCard
                  label="Avg. resolution"
                  value={overview.avg_resolution_minutes}
                  suffix="min"
                  icon={Clock}
                  accent="hsl(var(--status-investigating))"
                />
                <StatCard
                  label="False report rate"
                  value={overview.false_report_rate}
                  suffix="%"
                  icon={TrendingUp}
                  accent="hsl(var(--status-acknowledged))"
                />
              </div>

              {/* Bottom two-column grid */}
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Incidents by type */}
                <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
                  <h2 className="text-sm font-semibold">Incidents by type</h2>
                  <div className="mt-4 space-y-4">
                    {overview.incidents_by_type.map(({ type, count }) => {
                      const TypeIcon = TYPE_ICONS[type] || ShieldAlert;
                      const typeColorVar = `hsl(var(--type-${type.toLowerCase()}))`;
                      const pct = overview.total_incidents
                        ? (count / overview.total_incidents) * 100
                        : 0;

                      return (
                        <div key={type} className="flex items-center gap-3">
                          <TypeIcon
                            className="size-4 shrink-0"
                            style={{ color: typeColorVar }}
                          />
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-medium">{type}</span>
                              <span className="text-xs text-muted-foreground">
                                {count}
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: typeColorVar,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {overview.incidents_by_type.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-4">
                        No incidents yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent notifications */}
                <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Recent notifications</h2>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[hsl(var(--status-active-bg))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--status-active))]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    {notifications.length === 0 && (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No notifications yet.
                      </p>
                    )}
                    {notifications.map((n) => (
                      <NotificationRow key={n.id} notification={n} />
                    ))}
                  </div>
                </div>

                {/* Recent alerts */}
                <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm md:col-span-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Recent alerts</h2>
                    <Link
                      href="/alerts"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      View all
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                  <div className="mt-2 divide-y divide-border-subtle">
                    {recentAlerts.length === 0 && (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        No alerts yet.
                      </p>
                    )}
                    {recentAlerts.map((alert) => (
                      <RecentAlertRow key={alert.id} alert={alert} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}