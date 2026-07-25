"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type SubscribeCardProps = {
  title?: string;
  subtitle?: string;
  source?: string;
  className?: string;
};

export default function SubscribeCard({
  title = "Get weekly drops and guides",
  subtitle = "No spam. Just premium updates.",
  source = "blog_sidebar",
  className = "",
}: SubscribeCardProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error || "Subscription failed");
      }
      setEmail("");
      setMessage("Subscribed! Watch your inbox for offers.");
    } catch {
      setMessage("Unable to subscribe right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={["theme-primary-action rounded-3xl border border-neutral-200 bg-neutral-900 p-6 text-white", className].join(" ")}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70">{subtitle}</p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          required
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40 disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Joining..." : "Join"}
        </button>
      </form>
      {message ? <p className="mt-2 text-xs text-white/70">{message}</p> : null}
    </div>
  );
}
