import { ShieldCheck } from "lucide-react";

export default function EmptyState({
  icon: Icon = ShieldCheck,
  title = "Nothing here",
  description = "",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}