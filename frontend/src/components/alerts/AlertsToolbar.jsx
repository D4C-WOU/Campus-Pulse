"use client";

import { Search } from "lucide-react";

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest First",
  },
  {
    value: "oldest",
    label: "Oldest First",
  },
  {
    value: "priority",
    label: "Priority",
  },
];

export default function AlertsToolbar({
  filters,
  search,
  setSearch,
  sort,
  setSort,
  statusFilter,
  setStatusFilter,
}) {
  // const filters = [
  //   { value: "all", label: "All" },
  //   { value: "active", label: "Active" },
  //   { value: "investigating", label: "Investigating" },
  //   { value: "resolved", label: "Resolved" },
  //   { value: "false_report", label: "False Reports" },
  // ];

  return (
    <div className="mt-6 rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts..."
            className="w-full rounded-xl border border-border-subtle bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-border-subtle bg-background px-4 py-3 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${statusFilter === filter.value
              ? "bg-foreground text-background"
              : "border border-border-subtle hover:border-border-strong"
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}