// src/app/owner/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fetch } from "@/lib/fetch";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@luxstore.com");
  const [newEmail, setNewEmail] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await Fetch("/api/owner/admin-security", {
        method: "PUT",
        data: {
          email,
          name: name || undefined,
          newEmail: newEmail || undefined,
          newPassword: newPassword || undefined,
        },
      });

      if (!res.ok) {
        const message =
          Array.isArray(res.error)
            ? (res.error as any)[0]?.message || "Update failed"
            : res.error || "Update failed";
        throw new Error(message);
      }

      setMessage("Admin credentials updated.");
      setNewPassword("");
    } catch (error: any) {
      setErr(error?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    await Fetch("/api/owner/auth/logout", { method: "POST" });
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-[760px] px-5 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Owner Dashboard</p>
            <p className="text-xs text-neutral-500">
              Manage admin access without sharing the owner token.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold text-neutral-900">Reset Admin Login</p>
          <p className="mt-1 text-xs text-neutral-500">
            If the admin user does not exist, this will create a new admin account.
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700">Current admin email</label>
              <input
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700">New admin email (optional)</label>
              <input
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
                placeholder="Leave empty to keep the same"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700">Admin name (optional)</label>
              <input
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Leave empty to keep the same"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700">New admin password</label>
              <input
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="Set a new password"
              />
            </div>

            {err ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
              </div>
            ) : null}
            {message ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="mt-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
