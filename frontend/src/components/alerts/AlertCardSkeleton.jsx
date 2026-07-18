import { Skeleton } from "@/components/ui/skeleton";

export default function AlertCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="flex items-start justify-between gap-5">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
      </div>
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
}