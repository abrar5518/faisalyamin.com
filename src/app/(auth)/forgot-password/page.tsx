// src/app/(auth)/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 3, [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      // TODO: connect later
      // await fetch("/api/auth/forgot-password", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email }) })
      await new Promise((r) => setTimeout(r, 700)); // demo
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold">Reset your password</p>
            <p className="mt-1 text-sm text-neutral-600">
              Enter your email and we’ll send you a reset link.
            </p>
          </div>
          <Link href="/login" className="text-sm font-medium text-neutral-900 hover:underline">
            Back
          </Link>
        </div>

        {sent ? (
          <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-semibold">Check your inbox</p>
            <p className="mt-2 text-sm text-neutral-600">
              If an account exists for <span className="font-medium">{email}</span>, you’ll receive a password reset link.
              Please check spam/junk folders too.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/login"
                className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Return to login
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                Send again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@example.com"
              required
            />

            <button
              disabled={!canSubmit || loading}
              className={[
                "w-full rounded-2xl px-6 py-4 text-sm font-medium transition",
                !canSubmit || loading
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                  : "bg-neutral-900 text-white hover:bg-neutral-800",
              ].join(" ")}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-xs text-neutral-500">
              Don’t have an account?{" "}
              <Link href="/signup" className="font-medium text-neutral-900 hover:underline">
                Create one
              </Link>
            </p>
          </form>
        )}
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
