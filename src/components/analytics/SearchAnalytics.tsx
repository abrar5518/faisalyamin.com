"use client";

import { useEffect } from "react";
import { trackSearch } from "@/lib/googleAnalytics";

export default function SearchAnalytics({ searchTerm }: { searchTerm: string }) {
  useEffect(() => {
    trackSearch(searchTerm);
  }, [searchTerm]);

  return null;
}
