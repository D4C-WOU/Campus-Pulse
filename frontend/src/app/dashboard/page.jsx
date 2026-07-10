"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import { useAlertsSocket } from "@/hooks/useAlertsSocket";
import { getOverview } from "@/app/services/dashboardService";
import { HeartPulse, ShieldAlert, Clock, TrendingUp, Flame } from "lucide-react";

function StatCard({ label, value, icon: Icon, accent, suffix }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="size-4" style={{ color: accent }} />
      </div>
      <div className="mt-2 text-2xl font-medium">
        {value}
        {suffix && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const data = await getOverview();
      setOverview(data);
    } catch {
      toast.error("Couldn't load the analytics overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Any live alert event probably changed these numbers -- simplest
  // correct approach is to refetch rather than patch every stat by hand.
  const { connected } = useAlertsSocket(() => fetchOverview());

  return (
    <ProtectedRoute>
      <AppShell connected={connected}>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-xl font-medium">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Campus-wide incident overview, updated live.
          </p>

          {loading && (
            <p className="mt-6 text-sm text-muted-foreground">Loading overview...</p>
          )}

          {!loading && overview && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                  label="Active incidents"
                  value={overview.active_incidents}
                  icon={ShieldAlert}
                  accent="var(--status-active)"
                />
                <StatCard
                  label="Resolved"
                  value={overview.resolved_incidents}
                  icon={HeartPulse}
                  accent="var(--status-resolved)"
                />
                <StatCard
                  label="Avg. resolution"
                  value={overview.avg_resolution_minutes}
                  suffix="min"
                  icon={Clock}
                  accent="var(--accent-teal)"
                />
                <StatCard
                  label="False report rate"
                  value={overview.false_report_rate}
                  suffix="%"
                  icon={TrendingUp}
                  accent="var(--accent-amber)"
                />
              </div>

              <div className="mt-8 rounded-2xl border border-border-subtle bg-surface p-5">
                <h2 className="text-sm font-medium">Incidents by type</h2>
                <div className="mt-4 space-y-3">
                  {overview.incidents_by_type.map(({ type, count }) => (
                    <div key={type} className="flex items-center gap-3">
                      <Flame className="size-4 text-muted-foreground" />
                      <span className="w-24 text-sm">{type}</span>
                      <div className="h-2 flex-1 rounded-full bg-surface-elevated">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(count / overview.total_incidents) * 100}%`,
                            background:
                              "linear-gradient(90deg, var(--accent-teal), var(--accent-violet))",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-8">
            <Link
              href="/alerts"
              className="inline-block rounded-xl bg-surface-elevated px-4 py-2.5 text-sm transition-opacity hover:opacity-90"
            >
              Go to alerts
            </Link>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}