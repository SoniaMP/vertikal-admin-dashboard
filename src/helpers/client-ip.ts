/**
 * The caller's address as the reverse proxy reports it. `NextRequest` stopped
 * exposing `ip` in Next 15, and the club's VPS sits behind a proxy, so the
 * forwarded headers are the only source. Everything unknown shares one bucket,
 * which is the safe way round: it limits more, never less.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
