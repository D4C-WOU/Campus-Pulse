"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
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
  if (alert.status === "active") {
    actions.push({ label: "Acknowledge", fn: acknowledgeAlert, key: "ack" });
  }
  if (alert.status === "acknowledged") {
    actions.push({ label: "Investigate", fn: investigateAlert, key: "inv" });
  }
  if (["acknowledged", "investigating"].includes(alert.status)) {
    actions.push({ label: "Resolve", fn: resolveAlert, key: "res" });
  }
  if (alert.status !== "resolved" && alert.status !== "false_report") {
    actions.push({
      label: "Mark false",
      fn: markFalseReport,
      key: "false",
      subtle: true,
    });
  }

  return (
    <div
      // Added type-${alert.type} so the globals.css before-element border color triggers correctly
      className={cn(
        `ticket-card type-${alert.type}`,
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className={priority?.className}>
              {priority?.label} priority
            </span>
            <span className="text-slate-300">&middot;</span>
            <span className={`type-${alert.type.toLowerCase()}`}>{alert.type}</span>
          </div>
          <p className="mt-2 text-base font-medium text-slate-900 leading-snug">{alert.message}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm",
            status.className
          )}
          style={{ background: `hsl(var(--${status.className}-bg))` }}
        >
          <span className="flex items-center gap-1.5">
            <span className={`status-dot ${status.dot}`} />
            {status.label}
          </span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-4" />
          {alert.location_hint || "No location given"}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          {timeAgo(alert.created_at)}
        </span>
      </div>

      {actions.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          {actions.map((action) => (
            <button
              key={action.key}
              disabled={isActing}
              onClick={() => onAction(alert.id, action.fn, action.label)}
              className={cn(
                "rounded-lg px-5 py-2.5 text-sm font-bold transition-all shadow-sm disabled:opacity-50",
                action.key === "ack"
                  ? "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md border border-transparent"
                  : action.key === "res"
                    ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-md border border-transparent"
                    : action.subtle
                      ? "border-2 border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:bg-slate-50"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md border border-transparent"
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

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data.items);
    } catch {
      toast.error("Couldn't load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const { connected } = useAlertsSocket((event, data) => {
    setAlerts((prev) => {
      const exists = prev.some((a) => a.id === data.id);
      if (event === "NEW_ALERT") {
        if (exists) return prev;
        toast.info(`New ${data.type} report: ${data.message}`);
        return [data, ...prev];
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

  const filtered = useMemo(() => {
    if (statusFilter === "all") return alerts;
    return alerts.filter((a) => a.status === statusFilter);
  }, [alerts, statusFilter]);

  return (
    <ProtectedRoute>
      <AppShell connected={connected}>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Every reported incident, updated in real time.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition-all",
                  statusFilter === f.value
                    ? "bg-slate-800 text-white shadow-md"
                    : "border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {loading && (
              <p className="text-sm font-medium text-slate-500">Loading alerts...</p>
            )}
            {!loading && filtered.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-sm font-bold text-slate-500 bg-white">
                No alerts match this filter.
              </div>
            )}
            {filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAction={handleAction}
                actingId={actingId}
              />
            ))}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}