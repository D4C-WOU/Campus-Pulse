"use client";

import AlertCard from "./AlertCard";

export default function AlertSection({
  title,
  alerts,
  actingId,
  onAction,
  muted = false,
}) {
  if (!alerts.length) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2
          className={`text-sm font-semibold ${muted
              ? "text-muted-foreground"
              : "text-foreground"
            }`}
        >
          {title}
        </h2>

        <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-xs text-muted-foreground">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            actingId={actingId}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  );
}