type Bucket = { count: number; resetAt: number };

type RateLimitArgs = {
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  isAllowed: boolean;
  retryAfterSeconds: number;
};

/** Beyond this many tracked keys, expired ones are swept before adding more. */
const SWEEP_THRESHOLD = 1000;

const buckets = new Map<string, Bucket>();

function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * A fixed window counter held in memory. The club runs on a single VPS with
 * one process, so there is nothing to share state with and a dependency on
 * Redis would buy nothing. It resets when the process restarts, which is
 * acceptable: this exists to stop a loop of requests filling the disk, not to
 * meter an API.
 *
 * The map is swept of expired keys once it grows past a threshold, so a flood
 * of distinct addresses cannot turn the limiter itself into the leak.
 */
export function hitRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitArgs): RateLimitResult {
  const now = Date.now();
  if (buckets.size > SWEEP_THRESHOLD) sweepExpired(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { isAllowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  return {
    isAllowed: bucket.count <= limit,
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}
