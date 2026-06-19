// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fetch } from "@/lib/fetch";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await Fetch("/api/admin/auth/login", {
        method: "POST",
        data: { email, password },
      });

      if (!res.ok) {
        const message =
          Array.isArray(res.error)
            ? (res.error as any)[0]?.message || "Login failed"
            : res.error || "Login failed";
        throw new Error(message);
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error: any) {
      setErr(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-[520px] px-5 py-16">
        <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white text-sm font-semibold">
              A
            </span>
            <div>
              <p className="text-sm font-semibold">Store Admin</p>
              <p className="text-xs text-neutral-500">Sign in to manage store</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-7 grid gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700">Email</label>
              <input
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700">Password</label>
              <input
                className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </div>

            {err ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="mt-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-xs text-neutral-500">Tip: Use staff roles for limited access.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
