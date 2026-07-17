"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, ListChecks, ScrollText, LogOut, Radio } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import NotificationBell from "./NotificationBell";

// Each nav item gets its own accent color rather than one flat theme color --
// this is most of the "sleek but multicolor" feel: color is used to help
// wayfinding (which section am I in) rather than as pure decoration.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Activity, accent: "hsl(var(--status-investigating))" },
  { href: "/alerts", label: "Alerts", icon: ListChecks, accent: "hsl(var(--status-active))" },
  { href: "/audit-logs", label: "Audit log", icon: ScrollText, accent: "hsl(var(--status-resolved))" },
];

export default function AppShell({ children, connected = true }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border-subtle bg-surface/60 backdrop-blur-sm md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="brand-mark" />
          <span className="font-mono text-sm font-medium tracking-tight">
            campus_pulse
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon, accent }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" style={{ color: active ? accent : undefined }} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-subtle px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated/60 hover:text-foreground"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle bg-surface/40 px-5 py-3 backdrop-blur-sm md:hidden">
          <span className="font-mono text-sm">campus_pulse</span>
        </header>

        <div className="flex items-center justify-end gap-5 px-6 pt-4">

          <NotificationBell />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">

            <Radio
              className={cn(
                "size-3.5",
                connected
                  ? "text-[hsl(var(--status-resolved))]"
                  : "text-[hsl(var(--status-active))]"
              )}
            />

            {connected ? "Live" : "Reconnecting..."}

          </div>

        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}