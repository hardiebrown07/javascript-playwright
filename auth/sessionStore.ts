import { existsSync, readFileSync } from 'node:fs';
import { storageStatePath } from '../config/environments';
import { Role } from '../config/roles';

interface StoredCookie {
  name: string;
  /** Unix seconds. -1 means a session cookie with no expiry. */
  expires: number;
}

interface StoredState {
  cookies?: StoredCookie[];
}

/** Re-authenticate this far ahead of expiry, so a session cannot lapse mid-run. */
const EXPIRY_MARGIN_SECONDS = 5 * 60;

/**
 * Whether a role's saved session can be reused instead of logging in again.
 *
 * This is what makes authentication persist across runs rather than only
 * across tests within one run. Without it every invocation of the suite pays
 * for a fresh login per role, which on an SSO flow is the slowest thing in
 * the whole pipeline.
 *
 * Deliberately conservative: anything unreadable, unparseable or close to
 * expiring counts as invalid. A needless re-login costs seconds, whereas a
 * stale session costs a confusing mid-suite failure.
 */
export function hasValidSession(role: Role): boolean {
  const path = storageStatePath(role);
  if (!existsSync(path)) return false;

  let state: StoredState;
  try {
    state = JSON.parse(readFileSync(path, 'utf-8')) as StoredState;
  } catch {
    return false;
  }

  const cookies = state.cookies ?? [];
  if (cookies.length === 0) return false;

  const cutoff = Date.now() / 1000 + EXPIRY_MARGIN_SECONDS;

  // Session cookies (expires === -1) die with the browser, so a stored one is
  // only meaningful alongside at least one cookie that is still in date.
  const persistent = cookies.filter((c) => c.expires > 0);
  if (persistent.length === 0) {
    // Nothing but session cookies: reusable within a run, not across runs.
    return false;
  }

  return persistent.every((c) => c.expires > cutoff);
}

/** Why a session was rejected, for the setup log. */
export function sessionStatus(role: Role): string {
  return hasValidSession(role)
    ? `reusing saved session for "${role}"`
    : `no valid saved session for "${role}", authenticating`;
}
