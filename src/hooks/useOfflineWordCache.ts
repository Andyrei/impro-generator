"use client";
import { useEffect } from "react";
import { ICategory } from "@/lib/db/types/category";
import { prefetchAllWords } from "@/lib/offlineWordCache";

/**
 * On mount (when online) pre-fetches all words for every category × level
 * into the browser Cache API. Re-runs automatically when the device reconnects.
 */
export function useOfflineWordCache(categories: ICategory[]) {
  useEffect(() => {
    if (!categories?.length) return;

    const run = () => {
      if (navigator.onLine) {
        prefetchAllWords(categories);
      }
    };

    run();
    window.addEventListener("online", run);
    return () => window.removeEventListener("online", run);
  }, [categories]);
}
