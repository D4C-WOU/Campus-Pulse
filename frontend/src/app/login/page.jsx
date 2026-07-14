"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login, getMe } from "@/app/services/authService";
import { useAuthStore } from "@/store/authStore";
import { Radio, ShieldCheck, Clock, Activity } from "lucide-react";

// Real content instead of decoration -- this is what actually makes a
// split-screen login read as "product," not "AI slop." A gradient blob
// says nothing about the app; these three lines say what it does.
const FEATURES = [
  { icon: Activity, label: "Live incident feed", accent: "hsl(var(--status-investigating))" },
  { icon: Clock, label: "Sub-minute alert delivery", accent: "hsl(var(--status-acknowledged))" },
  { icon: ShieldCheck, label: "Full audit trail on every action", accent: "hsl(var(--status-resolved))" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token } = await login(email, password);
      localStorage.setItem("access_token", access_token);
      const user = await getMe(); // axios interceptor now attaches the token we just stored
      setAuth(user, access_token);
      toast.success(`Welcome back, ${user.full_name}.`);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: brand panel -- flat dark surface, no gradient, real content */}
      <div className="hidden flex-col justify-between bg-[hsl(222.2_47.4%_11.2%)] p-10 text-[hsl(210_40%_98%)] md:flex">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--status-investigating))]" />
          <span className="font-mono text-sm tracking-tight">campus_pulse</span>
        </div>

        <div>
          <h1 className="max-w-sm text-3xl font-medium leading-tight">
            Campus incidents, handled in real time.
          </h1>
          <p className="mt-3 max-w-sm text-sm text-[hsl(215_20.2%_65.1%)]">
            Anonymous reporting, live admin response, and a full audit trail
            for every incident on campus.
          </p>

          <div className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, label, accent }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${accent}22` }}
                >
                  <Icon className="size-4" style={{ color: accent }} />
                </div>
                <span className="text-sm text-[hsl(210_40%_98%)]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[hsl(215_20.2%_65.1%)]">
          <Radio className="size-3.5 text-[hsl(var(--status-resolved))]" />
          System operational
        </div>
      </div>

      {/* Right: the form -- Clinical light, generous whitespace, one accent */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand mark, since the left panel is hidden below md */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--status-investigating))]" />
            <span className="font-mono text-sm">campus_pulse</span>
          </div>

          <h2 className="text-xl font-medium">Admin sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Access the incident response dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[hsl(var(--status-investigating))]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[hsl(var(--status-investigating))]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[hsl(var(--status-investigating))] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Reporting an incident instead?{" "}
            <a href="/report" className="font-medium text-foreground underline underline-offset-2">
              Go to the public report form
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}