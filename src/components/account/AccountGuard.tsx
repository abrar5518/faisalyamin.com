"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AccountGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const res = await fetch("/api/account/me", { cache: "no-store" });
        if (!res.ok) {
          const qs = new URLSearchParams({ next: pathname });
          router.replace(`/login?${qs.toString()}`);
          return;
        }
      } finally {
        if (active) setChecking(false);
      }
    }
    check();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-600">Checking your account session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
