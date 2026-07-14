"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import { useAlertsSocket } from "@/hooks/useAlertsSocket";
import { getOverview } from "@/app/services/dashboardService";
import { HeartPulse, ShieldAlert, Clock, TrendingUp, Flame, Activity } from "lucide-react";

// Helper to map string types to icons visually
const TYPE_ICONS = {
  Fire: Flame,
  Medical: HeartPulse,
  Safety: ShieldAlert,
  Network: Activity,
};

function StatCard({ label, value, icon: Icon, accent, suffix }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="rounded-md p-1.5" style={{ backgroundColor: `${accent}15` }}>
          <Icon className="size-5" style={{ color: accent }} />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900">
        {value}
        {suffix && <span className="ml-1 text-sm font-semibold text-slate-500">{suffix}</span>}
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

  const { connected } = useAlertsSocket(() => fetchOverview());

  return (
    <ProtectedRoute>
      <AppShell connected={connected}>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Campus-wide incident overview, updated live.
          </p>

          {loading && (
            <p className="mt-6 text-sm font-medium text-slate-500">Loading overview...</p>
          )}

          {!loading && overview && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                  label="Active incidents"
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
                  accent="hsl(var(--type-network))"
                />
                <StatCard
                  label="False report rate"
                  value={overview.false_report_rate}
                  suffix="%"
                  icon={TrendingUp}
                  accent="hsl(var(--status-acknowledged))"
                />
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-6">Incidents by type</h2>
                <div className="space-y-4">
                  {overview.incidents_by_type.map(({ type, count }) => {
                    const TypeIcon = TYPE_ICONS[type] || ShieldAlert;
                    // Reference your globals.css custom color variables dynamically
                    const typeColorVar = `hsl(var(--type-${type.toLowerCase()}))`;

                    return (
                      <div key={type} className="flex items-center gap-4">
                        <div className="flex w-32 items-center gap-2">
                          <TypeIcon className="size-4" style={{ color: typeColorVar }} />
                          <span className="text-sm font-bold text-slate-700">{type}</span>
                        </div>
                        <div className="h-3 flex-1 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${(count / overview.total_incidents) * 100}%`,
                              backgroundColor: typeColorVar,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm font-bold text-slate-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="mt-8">
            <Link
              href="/alerts"
              className="inline-block rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-900 hover:shadow-md"
            >
              Go to alerts
            </Link>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}