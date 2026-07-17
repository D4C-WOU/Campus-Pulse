"use client";

import { useState } from "react";
import Link from "next/link";
import { createAlert } from "@/app/services/alertService";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { INCIDENT_CATEGORIES } from "@/lib/incidentCategories";

const INCIDENT_TYPES = [
  { value: "Fire", label: "🔥 Fire", hint: "Smoke, flames or fire emergency" },
  { value: "Medical", label: "🚑 Medical", hint: "Injury, illness or medical emergency" },
  { value: "Safety", label: "🛡️ Safety", hint: "Violence, suspicious activity or hazard" },
];

function TrackingCodeBox({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-6 rounded-xl border-2 border-[hsl(var(--status-active))] bg-[hsl(var(--status-active-bg))] p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[hsl(var(--status-active))]" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[hsl(var(--status-active))]">
            Save your tracking code now
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--status-active))]">
            This code cannot be recovered if lost. Copy and save it somewhere safe.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[hsl(var(--status-active)/0.3)] bg-white/60 px-4 py-3">
        <span className="flex-1 font-mono text-lg font-bold tracking-widest text-foreground">
          {code}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            copied
              ? "bg-[hsl(var(--status-resolved))] text-white"
              : "bg-foreground text-background hover:opacity-80"
          )}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy code
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [category, setCategory] = useState("");

  const handleTypeChange = (selectedType) => {
    setType(selectedType);
    setCategory("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type) {
      toast.error("Select an emergency type before submitting.");
      return;
    }
    if (!message.trim()) {
      toast.error("Describe what's happening so responders know what to expect.");
      return;
    }
    if (!category) {
      toast.error("Select the incident category.");
      return;
    }

    try {
      setSubmitting(true);
      const alert = await createAlert({
        type,
        message: `[${category}]\n\n${message.trim()}`,
        location_hint: locationHint.trim() || null,
        priority: "medium",
      });
      setSubmitted(alert);
    } catch {
      toast.error("Couldn't submit the report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const trackingCode = submitted.id?.slice(0, 8).toUpperCase();

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-8">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="size-10 text-[hsl(var(--status-resolved))]" />
            <h1 className="mt-4 text-xl font-medium">Report received</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your incident has been logged and campus security has been notified.
            </p>
          </div>

          <TrackingCodeBox code={trackingCode} />

          <div className="mt-6 rounded-lg border border-border-subtle bg-surface-elevated px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              Use this code on the{" "}
              <Link href="/check-status" className="font-medium underline underline-offset-2 hover:text-foreground">
                Check Status
              </Link>{" "}
              page to track your report.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => {
                setSubmitted(null);
                setType("");
                setCategory("");
                setMessage("");
                setLocationHint("");
              }}
              className="rounded-lg border border-border-subtle px-4 py-2.5 text-sm hover:border-border-strong"
            >
              File another report
            </button>
            <Link
              href="/"
              className="text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Home
        </Link>

        <h1 className="text-2xl font-medium tracking-tight">Report an emergency</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This report is anonymous. No account needed.
        </p>

        {/* Pre-submission tracking code warning */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[hsl(var(--status-acknowledged)/0.4)] bg-[hsl(var(--status-acknowledged-bg))] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[hsl(var(--status-acknowledged))]" />
          <p className="text-xs text-[hsl(var(--status-acknowledged))]">
            <span className="font-semibold">Save your tracking code</span> — after submitting you'll
            receive a unique code. Copy it immediately; it cannot be recovered if lost.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">What's happening?</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {INCIDENT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => handleTypeChange(t.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    type === t.value
                      ? "border-[hsl(var(--status-active))] bg-[hsl(var(--status-active-bg))]"
                      : "border-border-subtle bg-surface hover:border-border-strong"
                  )}
                >
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{t.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Incident category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!type}
              className="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--status-investigating))] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {type ? "Select category..." : "Choose an emergency type first"}
              </option>
              {(INCIDENT_CATEGORIES[type] || []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Describe the situation</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="e.g. Smoke coming from the second floor near the library entrance"
              className="w-full resize-none rounded-xl border border-border-subtle bg-surface px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[hsl(var(--status-investigating))]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Location <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              value={locationHint}
              onChange={(e) => setLocationHint(e.target.value)}
              placeholder="e.g. Block A, Library, Parking Lot 2"
              className="w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[hsl(var(--status-investigating))]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--status-active))] px-4 py-3.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </form>
      </div>
    </div>
  );
}