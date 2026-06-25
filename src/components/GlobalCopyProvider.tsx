"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_GLOBAL_COPY,
  parseGlobalCopy,
  type GlobalCopy,
} from "@/lib/globalCopy";

const GlobalCopyContext = createContext<GlobalCopy>(DEFAULT_GLOBAL_COPY);

export function GlobalCopyProvider({
  children,
  initialGlobalCopy,
}: {
  children: ReactNode;
  initialGlobalCopy?: string | null;
}) {
  const [copy, setCopy] = useState<GlobalCopy>(() => parseGlobalCopy(initialGlobalCopy));

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok && payload?.ok) {
          setCopy(parseGlobalCopy(payload.data?.globalCopy));
        }
      } catch {
        // Keep safe defaults when public settings are unavailable.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <GlobalCopyContext.Provider value={copy}>
      {children}
    </GlobalCopyContext.Provider>
  );
}

export function useGlobalCopy() {
  return useContext(GlobalCopyContext);
}
