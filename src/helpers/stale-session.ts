/**
 * Auth.js calls its session cookie `authjs.session-token`, prefixes it with
 * `__Secure-` when the site is served over https, and splits it into
 * `.0`, `.1`… chunks when it outgrows a cookie, so production and local
 * development do not even agree on the name.
 */
const SESSION_COOKIE_BASE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function isSessionCookie(name: string): boolean {
  return SESSION_COOKIE_BASE_NAMES.some(
    (base) => name === base || name.startsWith(`${base}.`),
  );
}

/**
 * Whether a request that failed to authenticate still carried a session
 * cookie, which is the only way to tell a session that ran out from a visitor
 * who never had one: the middleware sees `null` for both. Without it the login
 * page would either accuse every first-time visitor of having timed out or
 * leave a timed-out volunteer wondering why the panel threw them out.
 */
export function hasStaleSessionCookie(cookieNames: string[]): boolean {
  return cookieNames.some(isSessionCookie);
}
