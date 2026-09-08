/**
 * Roles the suite can authenticate as.
 *
 * Each needs `<ROLE>_USERNAME` and `<ROLE>_PASSWORD` in the environment;
 * see `.env.example`. Adding a role here is all that is required for
 * `auth.setup.ts` to log it in and save its session.
 */
export const ROLES = ['standard', 'problem'] as const;

export type Role = (typeof ROLES)[number];
