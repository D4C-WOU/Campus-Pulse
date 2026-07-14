"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import { getAdmins, createAdmin, deleteAdmin } from "@/app/services/adminService";
import { Trash2, UserPlus } from "lucide-react";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "admin" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAdmins()
      .then(setAdmins)
      .catch(() => toast.error("Couldn't load admin accounts."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newAdmin = await createAdmin(form);
      setAdmins((prev) => [newAdmin, ...prev]);
      setForm({ full_name: "", email: "", password: "", role: "admin" });
      toast.success("Admin account created.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Couldn't create admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this admin account? This can't be undone.")) return;
    try {
      await deleteAdmin(id);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      toast.success("Admin removed.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Couldn't remove admin.");
    }
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-xl font-medium">Admin management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and remove admin and dispatcher accounts. Super admin only.
          </p>

          <form
            onSubmit={handleCreate}
            className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border-subtle bg-surface p-5 sm:grid-cols-2"
          >
            <input required placeholder="Full name" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="rounded-xl border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-border-strong" />
            <input required type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-border-strong" />
            <input required type="password" placeholder="Temporary password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-xl border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-border-strong" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-xl border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-border-strong">
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
            </select>
            <button type="submit" disabled={submitting}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50 sm:col-span-2">
              <UserPlus className="size-4" />
              {submitting ? "Creating..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!loading && admins.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{a.full_name}</p>
                  <p className="text-xs text-muted-foreground">{a.email} · {a.role}</p>
                </div>
                {a.role !== "super_admin" && (
                  <button onClick={() => handleDelete(a.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-surface-elevated hover:text-[hsl(var(--status-active))]">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}