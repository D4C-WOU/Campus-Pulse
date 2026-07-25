"use client";

import { useState } from "react";
import { toast } from "sonner";
import { checkAlertStatus } from "@/app/services/publicService";
import { formatRelativeTime } from "@/lib/utils";
import { STATUS_META } from "@/lib/alertMeta";
import { Search, Radio, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useStatusSocket } from "@/hooks/useStatusSocket";
import { cn } from "@/lib/utils";

export default function CheckStatusPage() {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = (data) => {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: data.status,
        resolved_at: data.resolved_at ?? prev.resolved_at,
      };
    });
    toast.info(`Status updated to: ${data.status.replace("_", " ")}`);
  };

  // Use the full incident code (INC-XXXXXX) as the socket reference
  // The backend status_manager uses alert_id[:8] as key, but we connect
  // using the incident_code so it matches the public-facing reference.
  const { connected } = useStatusSocket(
    result ? result.reference : null,
    handleStatusUpdate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const raw = reference.trim().toUpperCase();
    if (!raw) return;

    setLoading(true);
    setResult(null);
    try {
      // Accept both "INC-000001" and raw codes; the backend normalizes
      const data = await checkAlertStatus(raw);
      setResult(data);
    } catch {
      toast.error("No report found for that reference. Double-check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const status = result ? STATUS_META[result.status] : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <h1 className="text-xl font-medium">Check report status</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the reference code you received when you submitted a report.
        It looks like <span className="font-mono font-medium">INC-000042</span>.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
          placeholder="e.g. INC-000042"
          maxLength={20}
          className="flex-1 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-sm font-mono tracking-wide uppercase outline-none focus:border-border-strong"
        />
        <button
          type="submit"
          disabled={loading || !reference.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm text-background disabled:opacity-50"
        >
          <Search className="size-4" />
          {loading ? "..." : "Check"}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-2xl border border-border-subtle bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-sm font-semibold capitalize">{result.type}</span>
              <p className="font-mono text-xs text-muted-foreground">{result.reference}</p>
            </div>
            <div className="flex items-center gap-2">
              {result.status !== "resolved" && result.status !== "false_report" && (
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    connected
                      ? "text-[hsl(var(--status-resolved))]"
                      : "text-muted-foreground"
                  )}
                >
                  <Radio className="size-3" />
                  {connected ? "Live" : "Connecting..."}
                </span>
              )}
              <span className={`text-xs ${status?.className}`}>
                {status?.label}
              </span>
            </div>
          </div>

          {result.location_hint && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Location
              </p>
              <p className="mt-1 text-sm">{result.location_hint}</p>
            </div>
          )}

          {result.message && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Report
              </p>
              <p className="mt-1 text-sm">{result.message}</p>
            </div>
          )}

          {result.latest_comment && (
            <div className="mt-4 rounded-xl border border-border-subtle bg-muted/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Latest update
              </p>
              <p className="mt-2 text-sm">{result.latest_comment}</p>
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Reported {formatRelativeTime(result.created_at)}
          </p>
          {result.resolved_at && (
            <p className="text-xs text-muted-foreground">
              Resolved {formatRelativeTime(result.resolved_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}