"use client";

import { useState } from "react";
import { Clock, MapPin, MessageSquare } from "lucide-react";
import { STATUS_META, PRIORITY_META } from "@/lib/alertMeta";
import {
  investigateAlert,
  resolveAlert,
  markFalseReport,
} from "@/app/services/alertService";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AlertCommentsPanel from "./AlertCommentsPanel";

export default function AlertCard({ alert, actingId, onAction }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const status = STATUS_META[alert.status] || STATUS_META.active;
  const priority = PRIORITY_META[alert.priority];
  const isActing = actingId === alert.id;

  const match = alert.message.match(/^\[(.+?)\]\n\n([\s\S]*)$/);
  const category = match?.[1];
  const description = match?.[2] ?? alert.message;

  const actions = [];
  if (alert.status === "active") {
    actions.push({ label: "Investigate", fn: investigateAlert, key: "investigate" });
  }
  if (alert.status === "investigating") {
    actions.push({ key: "resolve", label: "Resolve", fn: resolveAlert });
  }
  if (alert.status !== "resolved" && alert.status !== "false_report") {
    actions.push({ key: "false", label: "False Report", fn: markFalseReport, subtle: true });
  }

  return (
    <>
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
              <span className={priority?.className}>{priority?.label} priority</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{alert.type}</span>
            </div>

            {category && (
              <div className="mt-3">
                <span className="rounded-full border border-border-subtle bg-surface-elevated px-3 py-1 text-xs font-medium">
                  {category}
                </span>
              </div>
            )}

            <p className="mt-3 text-sm leading-relaxed">{description}</p>
          </div>

          <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", status.className)}>
            <span className="flex items-center gap-2">
              <span className={`status-dot ${status.dot}`} />
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
            {formatRelativeTime(alert.created_at)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              disabled={isActing}
              onClick={() => onAction(alert.id, action.fn, action.label)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                action.subtle
                  ? "border border-border-subtle text-muted-foreground hover:border-border-strong hover:text-foreground"
                  : "bg-foreground text-background hover:opacity-80"
              )}
            >
              {isActing ? "..." : action.label}
            </button>
          ))}

          <button
            onClick={() => setSheetOpen(true)}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <MessageSquare className="size-3.5" />
            Timeline
          </button>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border-subtle">
            <SheetTitle className="text-base">
              Incident Timeline
            </SheetTitle>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
              <span className="capitalize">{alert.type}</span>
              <span>•</span>
              <span className={priority?.className}>{priority?.label}</span>
              <span>•</span>
              <span className={cn("rounded-full px-2 py-0.5", status.className)}>
                {status.label}
              </span>
            </div>
            {alert.location_hint && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {alert.location_hint}
              </p>
            )}
          </SheetHeader>

          <div className="pt-4 px-0">
            <AlertCommentsPanel alertId={alert.id} alertStatus={alert.status} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}