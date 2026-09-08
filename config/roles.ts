/** Each role needs `<ROLE>_USERNAME` and `<ROLE>_PASSWORD` in the environment. */
export const ROLES = ['standard', 'problem'] as const;

export type Role = (typeof ROLES)[number];
