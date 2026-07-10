import Link from "next/link";
import { Activity, ShieldCheck, ArrowRight } from "lucide-react";

async function getStatus() {
  try {
    const res = await fetch(
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/health",
      { cache: "no-store" }
    );
    if (!res.ok) return "offline";
    const data = await res.json();
    return data.status === "healthy" ? "online" : "offline";
  } catch {
    return "offline";
  }
}

export default async function Home() {
  const status = await getStatus();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-[var(--status-resolved)]" />
          <span className="font-mono text-sm tracking-tight">
            campus_pulse
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1 text-xs text-muted-foreground">
          <span
            className={`pulse-dot ${status !== "online" ? "offline" : ""}`}
          />
          <span className="font-mono">
            {status === "online" ? "SYSTEM ONLINE" : "SYSTEM UNREACHABLE"}
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <svg
          viewBox="0 0 400 60"
          className="mb-6 h-10 w-64 text-[var(--status-resolved)] opacity-60"
        >
          <polyline
            className="ecg-line"
            points="0,30 60,30 80,10 100,50 120,30 400,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <h1 className="max-w-2xl text-balance font-mono text-3xl font-medium tracking-tight md:text-5xl">
          Report an emergency in seconds.
        </h1>
        <p className="mt-4 max-w-md text-balance text-muted-foreground">
          No account, no sign-up. Tell us what's happening and where --
          campus security sees it the moment you submit.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/report"
            className="group flex items-center gap-2 rounded-xl bg-[var(--status-active)] px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-[var(--status-active-bg)] transition-transform hover:scale-[1.02]"
          >
            Report an emergency
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-border-subtle px-6 py-3.5 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <ShieldCheck className="size-4" />
            Admin sign in
          </Link>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        Campus Pulse -- real-time incident reporting &amp; response
      </footer>
    </div>
  );
}
