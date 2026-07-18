"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import Pagination from "@/components/layout/Pagination";
import { useAlertsSocket } from "@/hooks/useAlertsSocket";
import {
  getAlerts,
  investigateAlert,
  resolveAlert,
  markFalseReport,
} from "@/app/services/alertService";
import AlertSection from "@/components/alerts/AlertSection";
import AlertsToolbar from "@/components/alerts/AlertsToolbar";
import AlertStats from "@/components/alerts/AlertStats";
import AlertCardSkeleton from "@/components/alerts/AlertCardSkeleton";
import EmptyState from "@/components/alerts/EmptyState";
import { ShieldCheck, Inbox } from "lucide-react";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "false_report", label: "False reports" },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actingId, setActingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const fetchAlerts = async (targetPage) => {
    try {
      setLoading(true);
      const statusParam = statusFilter === "all" ? null : statusFilter;
      const data = await getAlerts(targetPage, 10, statusParam);
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
        if (page !== 1) {
          toast.info(`New ${data.type} report — go to page 1 to see it.`);
          return prev;
        }
        toast.info(`New ${data.type} report: ${data.message}`);
        return [data, ...prev].slice(0, 10);
      }
      return prev.map((a) => (a.id === data.id ? data : a));
    });
  });

  const filteredAlerts = alerts
    .filter((alert) => {
      if (statusFilter !== "all" && alert.status !== statusFilter) return false;
      const q = search.toLowerCase();
      return (
        alert.type.toLowerCase().includes(q) ||
        alert.message.toLowerCase().includes(q) ||
        (alert.location_hint || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "priority") {
        const order = { critical: 4, high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const activeAlerts = filteredAlerts.filter((a) =>
    ["active", "investigating"].includes(a.status)
  );
  const handledAlerts = filteredAlerts.filter((a) =>
    ["resolved", "false_report"].includes(a.status)
  );

  const handleAction = async (id, actionFn, label) => {
    try {
      setActingId(id);
      const updated = await actionFn(id);
      setAlerts((prev) => prev.map((alert) => (alert.id === id ? updated : alert)));
      toast.success(`${label} recorded.`);
    } catch {
      toast.error(`Couldn't ${label.toLowerCase()} this alert.`);
    } finally {
      setActingId(null);
    }
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <ProtectedRoute>
      <AppShell connected={connected}>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="text-xl font-medium">Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every reported incident, updated in real time.
          </p>

          <AlertsToolbar
            filters={STATUS_FILTERS}
            statusFilter={statusFilter}
            setStatusFilter={handleFilterChange}
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
          />

          <AlertStats alerts={alerts} />

          {/* Loading skeletons */}
          {loading && (
            <div className="mt-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <AlertCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Populated */}
          {!loading && filteredAlerts.length > 0 && (
            <div className="transition-all duration-200">
              <AlertSection
                title={`Active Queue (${activeAlerts.length})`}
                alerts={activeAlerts}
                actingId={actingId}
                onAction={handleAction}
              />
              <AlertSection
                title={`Handled (${handledAlerts.length})`}
                alerts={handledAlerts}
                actingId={actingId}
                onAction={handleAction}
                muted
              />
            </div>
          )}

          {/* Empty state — no alerts at all */}
          {!loading && alerts.length === 0 && (
            <div className="mt-8">
              <EmptyState
                icon={ShieldCheck}
                title="All clear"
                description="No incidents have been reported yet. They'll appear here the moment someone submits a report."
              />
            </div>
          )}

          {/* Empty state — search/filter returned nothing */}
          {!loading && alerts.length > 0 && filteredAlerts.length === 0 && (
            <div className="mt-8">
              <EmptyState
                icon={Inbox}
                title="No matching alerts"
                description="Try adjusting your search or filter to find what you're looking for."
                action={
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                    className="rounded-lg border border-border-subtle px-4 py-2 text-xs font-medium hover:border-border-strong"
                  >
                    Clear filters
                  </button>
                }
              />
            </div>
          )}

          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}