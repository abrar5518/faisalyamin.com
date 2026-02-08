// src/app/(auth)/signup/page.tsx
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
  return score; // 0-4
}

function StrengthPill({ score }: { score: number }) {
  const label =
    score <= 1 ? "Weak" : score === 2 ? "Okay" : score === 3 ? "Strong" : "Very strong";

  const classes =
    score <= 1
      ? "border-neutral-200 bg-neutral-50 text-neutral-700"
      : score === 2
      ? "border-neutral-300 bg-neutral-50 text-neutral-900"
      : "border-neutral-900 bg-neutral-900 text-white";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] ${classes}`}>
      {label}
    </span>
  );
}

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useMemo(() => passwordScore(pw), [pw]);
  const passwordsMatch = pw.length > 0 && pw === pw2;

  const canSubmit = useMemo(() => {
    const basic =
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      email.trim().length > 3 &&
      pw.length >= 6 &&
      passwordsMatch &&
      agree;
    return Boolean(basic);
  }, [firstName, lastName, email, pw, passwordsMatch, agree]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password: pw,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error ?? "Signup failed");
      }

      window.location.href = "/account";
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
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
            <p className="text-sm font-semibold">Create your account</p>
            <p className="mt-1 text-sm text-neutral-600">
              Track orders, save addresses and manage your security.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            Sign in
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              value={firstName}
              onChange={setFirstName}
              placeholder="Abrar"
              required
            />
            <Field
              label="Last name"
              value={lastName}
              onChange={setLastName}
              placeholder="Hussain"
              required
            />
          </div>

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
            value={pw}
            onChange={setPw}
            type={showPw ? "text" : "password"}
            placeholder="Minimum 6 characters"
            required
            right={<StrengthPill score={score} />}
          />

          <Field
            label="Confirm password"
            value={pw2}
            onChange={setPw2}
            type={showPw ? "text" : "password"}
            placeholder="Re-enter password"
            required
            right={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-xs font-medium text-neutral-900 hover:underline"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            }
          />

          {pw2.length > 0 && !passwordsMatch ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              Passwords do not match.
            </div>
          ) : null}

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-semibold">Password tips</p>
            <ul className="mt-2 space-y-1 text-xs text-neutral-600">
              <li>• Use at least 8 characters for better security</li>
              <li>• Add an uppercase letter and a number</li>
              <li>• Include a symbol to make it harder to guess</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-600">
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-neutral-900 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-neutral-900 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            disabled={!canSubmit || loading}
            className={[
              "w-full rounded-2xl px-6 py-4 text-sm font-medium transition",
              !canSubmit || loading
                ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                : "bg-neutral-900 text-white hover:bg-neutral-800",
            ].join(" ")}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-x-0 top-1/2 border-t border-neutral-200" />
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-neutral-500">
                or continue with
              </span>
            </div>
          </div>

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
            You can update your profile and security settings from your account dashboard.
          </p>
        </form>
      </Card>

      <div className="mt-6 text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-neutral-900 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
