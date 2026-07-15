"use client";

import { useState } from "react";
import Link from "next/link";
import { createAlert } from "@/app/services/alertService";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { INCIDENT_CATEGORIES } from "@/lib/incidentCategories";

const INCIDENT_TYPES = [{ value: "Fire", label: "🔥 Fire", hint: "Smoke, flames or fire emergency", },
{ value: "Medical", label: "🚑 Medical", hint: "Injury, illness or medical emergency", },
{ value: "Safety", label: "🛡️ Safety", hint: "Violence, suspicious activity or hazard", },];

export default function ReportPage() {
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // holds created alert
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
        message: `[${category}]
        ${message.trim()}`,
        location_hint: locationHint.trim() || null,
        priority: "medium",
      });
      setSubmitted(alert);
    } catch (err) {
      toast.error("Couldn't submit the report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-8 text-center">
          <CheckCircle2 className="mx-auto size-10 text-[hsl(var(--status-resolved))]" />
          <h1 className="mt-4 text-xl font-medium">Report received</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your incident has been logged and campus security has been
            notified.
          </p>
          <div className="mt-6 rounded-lg border border-border-subtle bg-surface-elevated px-4 py-3">
            <div className="text-xs text-muted-foreground">Reference</div>
            <div className="font-mono text-sm">
              {submitted.id?.slice(0, 8)}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2">
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
              className="text-xs text-muted-foreground hover:text-foreground"
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

        <h1 className="text-2xl font-medium tracking-tight">
          Report an emergency
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This report is anonymous. No account needed.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              What's happening?
            </label>
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
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {t.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Incident category
            </label>

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
            <label className="mb-2 block text-sm font-medium">
              Describe the situation
            </label>
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
              Location{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
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
