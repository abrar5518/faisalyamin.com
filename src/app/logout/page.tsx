"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function run() {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        router.replace("/login");
      }
    }
    run();
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
      Signing you out...
    </div>
  );
}
