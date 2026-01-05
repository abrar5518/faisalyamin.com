// src/app/(auth)/reset-password/[token]/page.tsx
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
  right,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-neutral-700">
          {label} {required ? <span className="text-neutral-400">*</span> : null}
        </span>
        {right}
      </div>
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

function passwordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const token = params.token;

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useMemo(() => passwordScore(pw), [pw]);
  const match = pw.length > 0 && pw === pw2;

  const canSubmit = useMemo(() => pw.length >= 6 && match, [pw, match]);

  const strengthLabel =
    score <= 1 ? "Weak" : score === 2 ? "Okay" : score === 3 ? "Strong" : "Very strong";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: connect later
      // const res = await fetch("/api/auth/reset-password", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ token, password: pw }) })
      // if (!res.ok) throw new Error("Invalid or expired token");
      await new Promise((r) => setTimeout(r, 900)); // demo
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold">Create a new password</p>
            <p className="mt-1 text-sm text-neutral-600">
              Set a strong password to protect your account.
            </p>
          </div>
          <Link href="/login" className="text-sm font-medium text-neutral-900 hover:underline">
            Back
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {error}
          </div>
        ) : null}

        {done ? (
          <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-sm font-semibold">Password updated</p>
            <p className="mt-2 text-sm text-neutral-600">
              Your password has been changed successfully. You can now sign in.
            </p>
            <div className="mt-5">
              <Link
                href="/login"
                className="inline-flex rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field
              label="New password"
              value={pw}
              onChange={setPw}
              type={show ? "text" : "password"}
              placeholder="Minimum 6 characters"
              required
              right={
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-[11px]",
                    score <= 1
                      ? "border-neutral-200 bg-neutral-50 text-neutral-700"
                      : score === 2
                      ? "border-neutral-300 bg-neutral-50 text-neutral-900"
                      : "border-neutral-900 bg-neutral-900 text-white",
                  ].join(" ")}
                >
                  {strengthLabel}
                </span>
              }
            />

            <Field
              label="Confirm new password"
              value={pw2}
              onChange={setPw2}
              type={show ? "text" : "password"}
              placeholder="Re-enter password"
              required
              right={
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="text-xs font-medium text-neutral-900 hover:underline"
                >
                  {show ? "Hide" : "Show"}
                </button>
              }
            />

            {pw2.length > 0 && !match ? (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                Passwords do not match.
              </div>
            ) : null}

            <button
              disabled={!canSubmit || loading}
              className={[
                "w-full rounded-2xl px-6 py-4 text-sm font-medium transition",
                !canSubmit || loading
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                  : "bg-neutral-900 text-white hover:bg-neutral-800",
              ].join(" ")}
            >
              {loading ? "Updating..." : "Update password"}
            </button>

            <p className="text-xs text-neutral-500">
              Token: <span className="font-medium text-neutral-900">{token.slice(0, 10)}…</span>
            </p>
          </form>
        )}
      </Card>

      <div className="mt-6 text-center text-xs text-neutral-500">
        Didn’t request a reset?{" "}
        <Link href="/contact" className="font-medium text-neutral-900 hover:underline">
          Contact support
        </Link>
      </div>
    </div>
  );
}
