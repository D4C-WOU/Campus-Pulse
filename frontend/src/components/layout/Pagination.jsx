"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted-foreground">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg p-1.5 hover:bg-surface-elevated disabled:opacity-30"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span>Page {page} of {pages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="rounded-lg p-1.5 hover:bg-surface-elevated disabled:opacity-30"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}