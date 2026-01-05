// src/app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-700">
        {label} {required ? <span className="text-neutral-400">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
      />
    </label>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.trim().length >= 6;
  }, [email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error ?? "Invalid credentials");
      }

      const next = searchParams.get("next") || "/account";
      window.location.href = next;
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Mobile brand header */}
      <div className="mb-6 lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white text-sm font-semibold">
            LX
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">LuxStore</p>
            <p className="text-xs text-neutral-500">Premium eCommerce</p>
          </div>
        </Link>
      </div>

      <Card>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold">Welcome back</p>
            <p className="mt-1 text-sm text-neutral-600">
              Sign in to manage orders, addresses and security.
            </p>
          </div>
          <Link
            href="/signup"
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            Create account
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Minimum 6 characters"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300"
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-neutral-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            disabled={!canSubmit || loading}
            className={[
              "w-full rounded-2xl px-6 py-4 text-sm font-medium transition",
              !canSubmit || loading
                ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                : "bg-neutral-900 text-white hover:bg-neutral-800",
            ].join(" ")}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-x-0 top-1/2 border-t border-neutral-200" />
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-neutral-500">
                or continue with
              </span>
            </div>
          </div>

          {/* Social buttons UI (optional) */}
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Google
            </button>
            <button
              type="button"
              className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Apple
            </button>
          </div>

          <p className="pt-2 text-xs text-neutral-500">
            By signing in, you agree to our Terms and Privacy Policy.
          </p>
        </form>
      </Card>

      <div className="mt-6 text-center text-xs text-neutral-500">
        Need help?{" "}
        <Link href="/contact" className="font-medium text-neutral-900 hover:underline">
          Contact support
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto w-full max-w-xl text-sm text-neutral-500">Loading...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
