"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import { getAuditLogs } from "@/app/services/auditService";
import { useAlertsSocket } from "@/hooks/useAlertsSocket";

const ACTION_LABELS = {
  ALERT_ACKNOWLEDGED: "Acknowledged",
  ALERT_INVESTIGATING: "Marked investigating",
  ALERT_RESOLVED: "Resolved",
  FALSE_REPORT: "Marked false report",
};

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { connected } = useAlertsSocket();

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute requiredRole="super_admin">
      <AppShell connected={connected}>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="text-xl font-medium">Audit log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every administrative action taken on an incident, in order.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface">
            {loading && (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                Loading...
              </p>
            )}
            {error && (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                You need super admin access to view this, or the request
                failed.
              </p>
            )}
            {!loading && !error && logs.length === 0 && (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No administrative actions recorded yet.
              </p>
            )}
            {!loading && logs.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Incident</th>
                    <th className="px-5 py-3 font-medium">Admin</th>
                    <th className="px-5 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-5 py-3">
                        {ACTION_LABELS[log.action] || log.action}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {log.alert_type
                          ? `${log.alert_type} · ${log.alert_id?.slice(0, 8)}`
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {log.admin_email || "—"}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {formatTime(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
