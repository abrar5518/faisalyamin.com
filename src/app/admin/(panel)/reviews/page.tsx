"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Fetch } from "@/lib/fetch";

type ReviewRow = {
  id: number;
  rating: number;
  title?: string | null;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt?: string | null;
  product: { id: number; name: string; slug: string };
  user: { id: number; name: string; email?: string | null };
  images: Array<{ url: string; alt?: string | null }>;
};

const STATUS_TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

function StatusBadge({ status }: { status: ReviewRow["status"] }) {
  const styles =
    status === "APPROVED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "REJECTED"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${styles}`}>
      {status}
    </span>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminReviewsPage() {
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>("PENDING");
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const query = useMemo(() => {
    if (status === "ALL") return "";
    return `?status=${status}`;
  }, [status]);

  const loadReviews = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setMsg(null);
    }
    const res = await Fetch<ReviewRow[]>(`/api/admin/reviews${query}`, {
      auth: true,
      cache: "no-store",
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to load reviews.");
      setRows([]);
    } else {
      setRows((res.data as ReviewRow[]) ?? []);
    }
    setLoading(false);
  }, [query]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await Fetch<ReviewRow[]>(`/api/admin/reviews${query}`, {
        auth: true,
        cache: "no-store",
      });
      if (!active) return;
      if (!res.ok) {
        setMsg(res.error || "Failed to load reviews.");
        setRows([]);
      } else {
        setRows((res.data as ReviewRow[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [query]);

  const handleStatusChange = (nextStatus: (typeof STATUS_TABS)[number]) => {
    setStatus(nextStatus);
    setLoading(true);
    setMsg(null);
  };

  const updateStatus = async (id: number, nextStatus: "APPROVED" | "REJECTED") => {
    if (busyId) return;
    setBusyId(id);
    setMsg(null);
    const res = await Fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      auth: true,
      data: { status: nextStatus },
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to update review.");
    } else {
      await loadReviews();
    }
    setBusyId(null);
  };

  const deleteReview = async (id: number) => {
    if (busyId) return;
    setBusyId(id);
    setMsg(null);
    const res = await Fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
      auth: true,
    });
    if (!res.ok) {
      setMsg(res.error || "Failed to delete review.");
    } else {
      await loadReviews();
    }
    setBusyId(null);
  };

  return (
    <div className="bg-white">
      <AdminTopbar title="Reviews" />

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Product reviews</p>
            <p className="mt-1 text-xs text-neutral-500">
              Approve or reject reviews before they show up on product pages.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleStatusChange(tab)}
                className={[
                  "rounded-2xl border px-4 py-2 text-xs font-medium",
                  status === tab
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {msg ? (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {msg}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
            Loading reviews...
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{r.product.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    By {r.user.name || "Customer"} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
                <span className="rounded-full border border-neutral-200 px-2 py-1 text-xs">
                  Rating {r.rating}/5
                </span>
                {r.title ? <span className="font-semibold">{r.title}</span> : null}
              </div>

              <p className="mt-3 text-sm text-neutral-600">{r.body}</p>

              {r.images.length ? (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {r.images.map((img, idx) => (
                    <div
                      key={`${img.url}-${idx}`}
                      className="overflow-hidden rounded-2xl border border-neutral-200"
                    >
                      <img
                        src={img.url}
                        alt={img.alt || r.product.name}
                        className="h-24 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(r.id, "APPROVED")}
                  disabled={busyId === r.id}
                  className="rounded-2xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(r.id, "REJECTED")}
                  disabled={busyId === r.id}
                  className="rounded-2xl border border-neutral-200 px-4 py-2 text-xs font-medium hover:bg-neutral-50 disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  onClick={() => deleteReview(r.id)}
                  disabled={busyId === r.id}
                  className="rounded-2xl border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!loading && !rows.length ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
              No reviews found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
