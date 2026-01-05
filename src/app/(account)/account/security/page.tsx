// src/app/(account)/account/security/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  id: number;
  device: string;
  location: string;
  ip: string;
  lastActive: string; // display
  current?: boolean;
};

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

function StrengthPill({ score }: { score: number }) {
  const label =
    score <= 1 ? "Weak" : score === 2 ? "Okay" : score === 3 ? "Strong" : "Very strong";

  const cls =
    score <= 1
      ? "border-neutral-200 bg-neutral-50 text-neutral-700"
      : score === 2
      ? "border-neutral-300 bg-neutral-50 text-neutral-900"
      : "border-neutral-900 bg-neutral-900 text-white";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] ${cls}`}>
      {label}
    </span>
  );
}

function SessionCard({
  s,
  onLogout,
}: {
  s: Session;
  onLogout: (id: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{s.device}</p>
            {s.current ? (
              <span className="inline-flex items-center rounded-full border border-neutral-900 bg-neutral-900 px-3 py-1 text-[11px] text-white">
                Current session
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-neutral-600">{s.location}</p>
          <p className="mt-1 text-xs text-neutral-500">
            IP: {s.ip} • Last active: {s.lastActive}
          </p>
        </div>

        {!s.current ? (
          <button
            type="button"
            onClick={() => onLogout(s.id)}
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Log out
          </button>
        ) : (
          <span className="text-xs text-neutral-500">Active</span>
        )}
      </div>
    </div>
  );
}

export default function AccountSecurityPage() {
  const router = useRouter();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [show, setShow] = useState(false);

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const score = useMemo(() => passwordScore(newPw), [newPw]);
  const match = newPw.length > 0 && newPw === confirmPw;

  const canSave = useMemo(() => {
    return currentPw.trim().length >= 4 && newPw.trim().length >= 6 && match;
  }, [currentPw, newPw, match]);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setDone(false);

    try {
      const res = await fetch("/api/account/security/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error ?? "Incorrect current password");
      }

      setDone(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setDone(false), 2500);
    } catch (err: any) {
      setError(err?.message ?? "Could not update password");
    } finally {
      setSaving(false);
    }
  }

  async function logoutSession(id: number) {
    await fetch("/api/account/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  async function logoutAllOther() {
    await fetch("/api/account/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allOthers: true }),
    });
    setSessions((prev) => prev.filter((s) => s.current));
  }

  async function logoutCurrent() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/account/sessions", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) return;

        const data = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = data.map((s: any) => ({
          id: s.id,
          device: s.userAgent ? String(s.userAgent).slice(0, 60) : "Unknown device",
          location: "Current location",
          ip: s.ip ?? "Unknown IP",
          lastActive: s.lastActive
            ? new Date(s.lastActive).toLocaleString()
            : "Recently active",
          current: Boolean(s.current),
        }));

        if (active) setSessions(mapped);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Password */}
      <Card>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold">Password & access</p>
            <p className="mt-1 text-sm text-neutral-600">
              Change your password and keep your account secure.
            </p>
          </div>
          <Link href="/account/profile" className="text-sm font-medium text-neutral-900 hover:underline">
            Profile &gt;
          </Link>
        </div>

        {done ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            Password updated successfully.
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onChangePassword} className="mt-6 space-y-4">
          <Field
            label="Current password"
            value={currentPw}
            onChange={setCurrentPw}
            type={show ? "text" : "password"}
            required
          />

          <Field
            label="New password"
            value={newPw}
            onChange={setNewPw}
            type={show ? "text" : "password"}
            required
            right={<StrengthPill score={score} />}
          />

          <Field
            label="Confirm new password"
            value={confirmPw}
            onChange={setConfirmPw}
            type={show ? "text" : "password"}
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

          {confirmPw.length > 0 && !match ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              Passwords do not match.
            </div>
          ) : null}

          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-xs font-semibold">Security tips</p>
            <ul className="mt-2 space-y-1 text-xs text-neutral-600">
              <li>• Use 8+ characters for best protection</li>
              <li>• Include uppercase, number and a symbol</li>
              <li>• Avoid reusing old passwords</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-500">
              After changing password, other sessions can be logged out.
            </p>

            <button
              disabled={!canSave || saving}
              className={[
                "rounded-2xl px-6 py-4 text-sm font-medium transition",
                !canSave || saving
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                  : "bg-neutral-900 text-white hover:bg-neutral-800",
              ].join(" ")}
            >
              {saving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </Card>

      {/* Sessions */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Active sessions</p>
            <p className="mt-1 text-sm text-neutral-600">
              Review devices that are signed in to your account.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={logoutCurrent}
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium hover:bg-neutral-50"
            >
              Log out current
            </button>

            <button
              type="button"
              onClick={logoutAllOther}
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Log out others
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {loading ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
              Loading sessions...
            </div>
          ) : (
            sessions.map((s) => (
              <SessionCard key={s.id} s={s} onLogout={logoutSession} />
            ))
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-sm font-semibold">Suspicious activity?</p>
          <p className="mt-2 text-sm text-neutral-600">
            If you see an unknown device, log out all sessions and change your password immediately.
          </p>
          <div className="mt-4">
            <Link href="/contact" className="text-sm font-medium text-neutral-900 hover:underline">
              Contact support →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
