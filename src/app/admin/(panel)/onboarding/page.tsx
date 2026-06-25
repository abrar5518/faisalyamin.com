"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  Paintbrush,
  Rocket,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import {
  AdminCard,
  AdminEmptyState,
  AdminPageHeader,
  AdminStatusBadge,
} from "@/components/admin/ui";
import { Fetch } from "@/lib/fetch";
import type {
  OnboardingSummary,
  OnboardingTask,
  OnboardingTaskGroup,
} from "@/lib/onboardingChecklist";

const GROUP_ORDER: OnboardingTaskGroup[] = [
  "Brand",
  "Store",
  "Content",
  "Catalog",
  "Conversion",
  "Growth",
];

function groupIcon(group: OnboardingTaskGroup) {
  if (group === "Brand") return <Paintbrush className="h-4 w-4" />;
  if (group === "Store") return <Store className="h-4 w-4" />;
  if (group === "Catalog") return <ShoppingBag className="h-4 w-4" />;
  if (group === "Conversion") return <ShieldCheck className="h-4 w-4" />;
  if (group === "Growth") return <Sparkles className="h-4 w-4" />;
  return <Settings2 className="h-4 w-4" />;
}

function taskStatus(task: OnboardingTask) {
  if (task.complete) return <AdminStatusBadge variant="success">Done</AdminStatusBadge>;
  if (task.required) return <AdminStatusBadge variant="warning">Required</AdminStatusBadge>;
  return <AdminStatusBadge>Optional</AdminStatusBadge>;
}

function TaskCard({ task }: { task: OnboardingTask }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
            task.complete
              ? "bg-green-100 text-green-700"
              : task.required
                ? "bg-yellow-100 text-yellow-700"
                : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {task.complete ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-950">{task.title}</h3>
            {taskStatus(task)}
          </div>
          <p className="mt-1 text-sm leading-6 text-neutral-600">{task.description}</p>
          {task.detail ? <p className="mt-2 text-xs text-neutral-500">{task.detail}</p> : null}
        </div>
      </div>

      <Link
        href={task.href}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
      >
        {task.actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function AdminOnboardingPage() {
  const [summary, setSummary] = useState<OnboardingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setLoading(true);
      setError("");
      const res = await Fetch<OnboardingSummary>("/api/admin/onboarding", {
        auth: true,
        cache: "no-store",
      });

      if (!active) return;
      if (res.ok && res.data) {
        setSummary(res.data);
      } else {
        setError(res.error || "Could not load onboarding checklist.");
      }
      setLoading(false);
    }

    loadSummary();
    return () => {
      active = false;
    };
  }, []);

  const groupedTasks = useMemo(() => {
    const map = new Map<OnboardingTaskGroup, OnboardingTask[]>();
    for (const group of GROUP_ORDER) map.set(group, []);
    for (const task of summary?.tasks || []) {
      map.set(task.group, [...(map.get(task.group) || []), task]);
    }
    return GROUP_ORDER.map((group) => ({ group, tasks: map.get(group) || [] })).filter(
      (entry) => entry.tasks.length
    );
  }, [summary]);

  async function applyTemplate() {
    setSaving(true);
    setError("");
    const res = await Fetch<OnboardingSummary>("/api/admin/onboarding", {
      method: "POST",
      auth: true,
      data: { action: "apply-generic-template" },
    });

    if (res.ok && res.data) {
      setSummary(res.data);
    } else {
      setError(res.error || "Could not apply starter template.");
    }
    setSaving(false);
  }

  const requiredPercent = summary
    ? Math.round((summary.requiredCompleted / summary.requiredTotal) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminTopbar title="Onboarding" />

      <div className="mx-auto w-full max-w-[1360px] px-5 py-8 sm:px-8 lg:px-12">
        <AdminPageHeader
          eyebrow="White-label setup"
          title="New Client Onboarding"
          description="Configure the store from one checklist before handing it to any client or launching a new niche."
          actions={
            <>
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                View storefront
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={applyTemplate}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Apply starter template
              </button>
            </>
          }
        />

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <AdminCard className="mt-8">
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading launch checklist...
            </div>
          </AdminCard>
        ) : summary ? (
          <>
            <div className="mt-8 grid gap-5 lg:grid-cols-12">
              <AdminCard
                className="lg:col-span-8"
                title={summary.isLaunchReady ? "Launch ready" : "Launch readiness"}
                description="Required tasks should be completed before the store is handed over."
                actions={
                  summary.isLaunchReady ? (
                    <AdminStatusBadge variant="success">Ready</AdminStatusBadge>
                  ) : (
                    <AdminStatusBadge variant="warning">Needs setup</AdminStatusBadge>
                  )
                }
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-4xl font-semibold text-neutral-950">{requiredPercent}%</p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {summary.requiredCompleted} of {summary.requiredTotal} required tasks complete
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-neutral-600 sm:min-w-60">
                    <div className="flex items-center justify-between">
                      <span>Total checklist</span>
                      <span className="font-semibold text-neutral-950">
                        {summary.completed}/{summary.total}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-neutral-950 transition-all"
                        style={{ width: `${summary.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </AdminCard>

              <AdminCard
                className="lg:col-span-4"
                title="Starter template"
                description="Adds generic, reusable defaults without overwriting configured fields."
              >
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-green-700" />
                    Generic policy pages
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-green-700" />
                    Default header, footer, checkout, cart, and theme settings
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-green-700" />
                    Starter category and reusable trust blocks
                  </div>
                </div>
              </AdminCard>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdminCard>
                <p className="text-xs text-neutral-500">Active products</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-950">{summary.counts.products}</p>
              </AdminCard>
              <AdminCard>
                <p className="text-xs text-neutral-500">Categories</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-950">{summary.counts.categories}</p>
              </AdminCard>
              <AdminCard>
                <p className="text-xs text-neutral-500">Managed pages</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-950">{summary.counts.pages}</p>
              </AdminCard>
              <AdminCard>
                <p className="text-xs text-neutral-500">Reusable blocks</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-950">{summary.counts.reusableBlocks}</p>
              </AdminCard>
            </div>

            <div className="mt-8 space-y-6">
              {groupedTasks.map((entry) => (
                <section key={entry.group}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-950">
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-neutral-700 shadow-sm">
                      {groupIcon(entry.group)}
                    </span>
                    {entry.group}
                  </div>
                  <div className="space-y-3">
                    {entry.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <AdminEmptyState
            icon={<ClipboardCheck className="h-8 w-8" />}
            title="No onboarding data"
            description="Refresh the page or check the admin API."
          />
        )}

        <AdminCard
          className="mt-8"
          title="Hand-off rule"
          description="Use this before selling or deploying the same software for another client."
        >
          <div className="grid gap-4 text-sm leading-6 text-neutral-600 md:grid-cols-3">
            <div className="rounded-2xl bg-neutral-50 p-4">
              <Rocket className="mb-3 h-5 w-5 text-neutral-900" />
              Remove niche-specific copy and images before launch.
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-neutral-900" />
              Keep checkout, tracking, contact, and domain managed from settings only.
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4">
              <ShoppingBag className="mb-3 h-5 w-5 text-neutral-900" />
              Add real products last, after branding and policy pages are ready.
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
