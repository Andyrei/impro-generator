import { ICategory } from "@/lib/db/types/category";
import { IWord } from "@/lib/db/types/word";

const CACHE_NAME = "offline-words-v1";

function cacheKey(categoryId: string, level: string) {
  return `/offline-words/${categoryId}/${level}`;
}

/**
 * Pre-fetches all words for every category × level and stores them in the
 * browser Cache API so they are available when the device is offline.
 */
export async function prefetchAllWords(
  categories: ICategory[]
): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const cache = await caches.open(CACHE_NAME);

  for (const cat of categories) {
    for (const level of ["1", "2", "3"]) {
      const url = `/api/v1/words?action=${cat._id}&level=${level}&limit=200`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          // Store a clone — the original is consumed by the put call
          await cache.put(cacheKey(String(cat._id), level), response);
        }
      } catch {
        // Network unavailable — skip, we'll retry on next online event
      }
    }
  }
}

/**
 * Retrieves all pre-cached words for a given category + level from Cache API.
 * Returns an empty array if nothing is cached.
 */
export async function getOfflineWords(
  categoryId: string,
  level: string
): Promise<IWord[]> {
  if (typeof window === "undefined" || !("caches" in window)) return [];

  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(cacheKey(categoryId, level));
    if (!response) return [];

    const json = await response.clone().json();
    return (json?.data as IWord[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Picks a random word from a list, excluding already-seen IDs.
 * If all words have been seen, resets and picks from the full list.
 */
export function pickOfflineWord(
  words: IWord[],
  excludeIds: Set<string>
): IWord | undefined {
  let pool = words.filter((w) => !excludeIds.has(String(w._id)));
  if (pool.length === 0) pool = words; // reset
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}
