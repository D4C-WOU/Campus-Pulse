"use client";

import {
  AlertTriangle,
  SearchCheck,
  CheckCircle2,
  Ban,
} from "lucide-react";

const CARDS = [
  {
    key: "active",
    label: "Active",
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
  },
  {
    key: "investigating",
    label: "Investigating",
    icon: SearchCheck,
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300",
  },
  {
    key: "resolved",
    label: "Resolved",
    icon: CheckCircle2,
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300",
  },
  {
    key: "false_report",
    label: "False Reports",
    icon: Ban,
    className:
      "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300",
  },
];

export default function AlertStats({ alerts }) {
  const stats = {
    active: alerts.filter((a) => a.status === "active").length,
    investigating: alerts.filter((a) =>
      ["investigating"].includes(a.status)
    ).length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
    false_report: alerts.filter((a) => a.status === "false_report").length,
  };

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className={`rounded-2xl border p-4 ${card.className}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-70">
                  {card.label}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {stats[card.key]}
                </p>
              </div>

              <Icon className="size-7 opacity-70" />
            </div>
          </div>
        );
      })}
    </div>
  );
}