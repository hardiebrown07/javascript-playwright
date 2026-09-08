import { existsSync, readFileSync } from 'node:fs';
import { storageStatePath } from '../config/environments';
import { Role } from '../config/roles';

interface StoredCookie {
  name: string;
  /** Unix seconds; -1 for a session cookie. */
  expires: number;
}

interface StoredState {
  cookies?: StoredCookie[];
}

/** Re-authenticate this far ahead of expiry so a session cannot lapse mid-run. */
const EXPIRY_MARGIN_SECONDS = 5 * 60;

/**
 * Whether a role's saved session can be reused instead of signing in again.
 *
 * Treats anything doubtful as invalid: a file that will not parse, one holding
 * only session cookies, or one inside the expiry margin. Signing in again takes
 * a few seconds. A session that lapses mid-run fails tests that have nothing to
 * do with authentication, and the stack trace points at the wrong place.
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

  const persistent = (state.cookies ?? []).filter((c) => c.expires > 0);
  if (persistent.length === 0) return false;

  const cutoff = Date.now() / 1000 + EXPIRY_MARGIN_SECONDS;
  return persistent.every((c) => c.expires > cutoff);
}
