import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-surface-elevated", className)}
      {...props}
    />
  );
}