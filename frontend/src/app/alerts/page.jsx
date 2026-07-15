"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import Pagination from "@/components/layout/Pagination";
import { useAlertsSocket } from "@/hooks/useAlertsSocket";
import { STATUS_META, PRIORITY_META } from "@/lib/alertMeta";
import { cn } from "@/lib/utils";
import {
  getAlerts,
  acknowledgeAlert,
  investigateAlert,
  resolveAlert,
  markFalseReport,
} from "@/app/services/alertService";
import { Clock, MapPin } from "lucide-react";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "false_report", label: "False reports" },
];

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AlertCard({ alert, onAction, actingId }) {
  const status = STATUS_META[alert.status] || STATUS_META.active;
  const priority = PRIORITY_META[alert.priority];
  const isActing = actingId === alert.id;

  const actions = [];
  if (alert.status === "active") actions.push({ label: "Acknowledge", fn: acknowledgeAlert, key: "ack" });
  if (alert.status === "acknowledged") actions.push({ label: "Investigate", fn: investigateAlert, key: "inv" });
  if (["acknowledged", "investigating"].includes(alert.status)) actions.push({ label: "Resolve", fn: resolveAlert, key: "res" });
  if (alert.status !== "resolved" && alert.status !== "false_report") {
    actions.push({ label: "Mark false", fn: markFalseReport, key: "false", subtle: true });
  }

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface p-5"
      style={{ borderLeftWidth: 3, borderLeftColor: `var(--priority-${alert.priority})` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={priority?.className}>{priority?.label} priority</span>
            <span className="text-muted-foreground">&middot;</span>
            <span className="text-muted-foreground">{alert.type}</span>
          </div>
          <p className="mt-1.5 text-sm leading-snug">{alert.message}</p>
        </div>
        <span
          className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", status.className)}
          style={{ background: `hsl(var(--${status.className}-bg))` }}
        >
          <span className="flex items-center gap-1.5">
            <span className={`status-dot ${status.dot}`} />
            {status.label}
          </span>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {alert.location_hint || "No location given"}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {timeAgo(alert.created_at)}
        </span>
      </div>

      {actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              disabled={isActing}
              onClick={() => onAction(alert.id, action.fn, action.label)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50",
                action.subtle
                  ? "border border-border-subtle text-muted-foreground hover:border-border-strong hover:text-foreground"
                  : "bg-surface-elevated text-foreground hover:bg-[hsl(var(--status-investigating-bg))]"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actingId, setActingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchAlerts = async (targetPage) => {
    try {
      setLoading(true);
      const statusParam = statusFilter === "all" ? null : statusFilter;
      const data = await getAlerts(targetPage, 20, statusParam);
      setAlerts(data.items);
      setPages(data.pages);
    } catch {
      toast.error("Couldn't load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const { connected } = useAlertsSocket((event, data) => {
    setAlerts((prev) => {
      const exists = prev.some((a) => a.id === data.id);
      if (event === "NEW_ALERT") {
        if (exists) return prev;
        // Only splice into the visible list on page 1 -- inserting on any
        // other page would silently push an item off-screen and desync
        // the pagination count from what's actually rendered.
        if (page !== 1) {
          toast.info(`New ${data.type} report — go to page 1 to see it.`);
          return prev;
        }
        toast.info(`New ${data.type} report: ${data.message}`);
        return [data, ...prev].slice(0, 20);
      }
      return prev.map((a) => (a.id === data.id ? data : a));
    });
  });

  const handleAction = async (id, actionFn, label) => {
    try {
      setActingId(id);
      const updated = await actionFn(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success(`${label} recorded.`);
    } catch {
      toast.error(`Couldn't ${label.toLowerCase()} this alert.`);
    } finally {
      setActingId(null);
    }
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1); // reset paging whenever the filter changes
  };

  return (
    <ProtectedRoute>
      <AppShell connected={connected}>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="text-xl font-medium">Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every reported incident, updated in real time.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs transition-colors",
                  statusFilter === f.value
                    ? "bg-foreground text-background"
                    : "border border-border-subtle text-muted-foreground hover:border-border-strong hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading alerts...</p>}
            {!loading && alerts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
                No alerts match this filter.
              </div>
            )}
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onAction={handleAction} actingId={actingId} />
            ))}
          </div>

          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}