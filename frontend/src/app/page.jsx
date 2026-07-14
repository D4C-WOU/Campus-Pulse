"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, HeartPulse, ShieldAlert, ArrowRight, Activity } from "lucide-react";
import { getAlerts } from "@/app/services/alertService"; // Added dynamic fetch

const TYPE_ICONS = {
  Fire: Flame,
  Medical: HeartPulse,
  Safety: ShieldAlert,
  Network: Activity,
};

export default function HomePage() {
  const [liveQueue, setLiveQueue] = useState([]);

  useEffect(() => {
    async function fetchRecentAlerts() {
      try {
        const data = await getAlerts();
        // Dynamically slice the 3 most recent incidents for the live queue
        setLiveQueue(data.items.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch live queue data", error);
      }
    }
    fetchRecentAlerts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--status-investigating))] animate-pulse" />
          <span className="font-data text-sm font-semibold">campus_pulse</span>
        </div>
        {/* Updated: High-visibility Admin Sign-in Button */}
        <Link
          href="/login"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-900 hover:shadow-md"
        >
          Admin sign in
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-16 md:px-10">
        <p className="font-data text-xs uppercase text-muted-foreground font-bold tracking-wider">
          Campus incident response
        </p>
        <h1 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-tight md:text-5xl text-slate-900">
          Report it in seconds.
          <br />
          Watch it get handled.
        </h1>
        <p className="mt-4 max-w-md text-slate-600 font-medium">
          Anonymous reporting for fire, medical, and safety incidents —
          routed to campus responders the moment you submit.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          {/* Updated: Bold, high-contrast action button */}
          <Link
            href="/report"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            Report an incident
            <ArrowRight className="size-4" />
          </Link>
          {/* Updated: Crisp border for secondary action */}
          <Link
            href="/check-status"
            className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50"
          >
            Check report status
          </Link>
        </div>

        <div className="mt-16 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-data text-xs uppercase text-slate-500 font-bold tracking-wider">
              Live queue — Recent
            </p>
          </div>

          {/* Updated: Dynamic mapping matching incident types to globals.css color classes */}
          {liveQueue.map((alert) => {
            const Icon = TYPE_ICONS[alert.type] || ShieldAlert;
            return (
              <div
                key={alert.code || alert.id}
                className={`ticket-card type-${alert.type} severity-${alert.severity || 'medium'} flex items-center gap-4 py-4 pr-4 bg-white`}
              >
                <div className={`p-2 rounded-full bg-type-${alert.type.toLowerCase()} bg-opacity-20`}>
                  <Icon className={`size-5 type-${alert.type.toLowerCase()}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{alert.type}</span>
                    <span className="font-data text-xs text-slate-400">#{alert.code || alert.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-slate-600">{alert.message || alert.note}</p>
                </div>
              </div>
            );
          })}

          {liveQueue.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm font-medium text-slate-500">
              No recent incidents in the queue.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}