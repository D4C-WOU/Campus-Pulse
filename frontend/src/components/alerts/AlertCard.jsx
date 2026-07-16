"use client";

import { Clock, MapPin } from "lucide-react";
import { STATUS_META, PRIORITY_META } from "@/lib/alertMeta";
import { cn } from "@/lib/utils";
import {
  investigateAlert,
  resolveAlert,
  markFalseReport,
} from "@/app/services/alertService";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();

  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertCard({
  alert,
  actingId,
  onAction,
}) {
  const status =
    STATUS_META[alert.status] || STATUS_META.active;

  const priority =
    PRIORITY_META[alert.priority];

  const isActing = actingId === alert.id;

  // Parse category from message
  const match = alert.message.match(
    /^\[(.+?)\]\n\n([\s\S]*)$/
  );

  const category = match?.[1];
  const description = match?.[2] ?? alert.message;

  const actions = [];

  if (alert.status === "active") {
    actions.push({
      label: "Investigate",
      fn: investigateAlert,
      key: "investigate",
    });
  }

  if (alert.status === "investigating") {
    actions.push({
      key: "resolve",
      label: "Resolve",
      fn: resolveAlert,
    });
  }

  if (
    alert.status !== "resolved" &&
    alert.status !== "false_report"
  ) {
    actions.push({
      key: "false",
      label: "False Report",
      fn: markFalseReport,
      subtle: true,
    });
  }

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface p-5 transition-shadow hover:shadow-sm"
      style={{
        borderLeftWidth: 6,
        borderLeftColor: `var(--priority-${alert.priority})`,
      }}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={priority?.className}>
              {priority?.label} priority
            </span>

            <span className="text-muted-foreground">
              •
            </span>

            <span className="text-muted-foreground">
              {alert.type}
            </span>
          </div>

          {category && (
            <div className="mt-3">
              <span className="rounded-full border border-border-subtle bg-surface-elevated px-3 py-1 text-xs font-medium">
                {category}
              </span>
            </div>
          )}

          <p className="mt-3 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
            status.className
          )}
        >
          <span className="flex items-center gap-2">
            <span
              className={`status-dot ${status.dot}`}
            />
            {status.label}
          </span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {alert.location_hint || "No location"}
        </span>

        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {timeAgo(alert.created_at)}
        </span>
      </div>

      {actions.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              disabled={isActing}
              onClick={() =>
                onAction(
                  alert.id,
                  action.fn,
                  action.label
                )
              }
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50",
                action.subtle
                  ? "border border-border-subtle text-muted-foreground hover:border-border-strong hover:text-foreground"
                  : "bg-surface-elevated hover:bg-[hsl(var(--status-investigating-bg))]"
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