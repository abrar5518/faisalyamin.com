// src/components/admin/AdminTopbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fetch } from "@/lib/fetch";

export default function AdminTopbar({ title }: { title: string }) {
  const router = useRouter();

  const logout = async () => {
    try {
      await Fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken");
      }
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-neutral-500">Admin panel</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              View store
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Logout
            </button>
            <button className="btn-primary px-4 py-2 text-sm">New</button>
          </div>
        </div>
      </div>
    </div>
  );
}
