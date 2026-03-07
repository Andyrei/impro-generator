import type { Session } from "next-auth";

/**
 * Returns true if:
 *  1. session.user.isAdmin is true (set from the DB User document), OR
 *  2. the user's email is listed in ADMIN_EMAILS env var (comma-separated fallback)
 *
 * The DB field is the primary source of truth; the env var lets you bootstrap
 * the very first admin before any DB record has isAdmin set.
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  if ((session.user as any).isAdmin === true) return true;
  if (!session.user.email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(session.user.email.toLowerCase());
}
