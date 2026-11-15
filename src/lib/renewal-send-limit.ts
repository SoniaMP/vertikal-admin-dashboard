const WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 3;

const sendTimes = new Map<string, number[]>();

/**
 * Caps how often a code may be sent for one DNI, and records the send.
 *
 * Without this the club becomes a way to flood someone else's inbox: anyone
 * who knows a member's DNI could ask for code after code. A per-IP limit does
 * not cover that case, because the target is the victim, not the sender.
 *
 * The limit is applied before we ever look for the member, so an attacker
 * cannot tell a throttled DNI from an unknown one.
 *
 * In memory on purpose: one VPS, one process. It resets on deploy, which is
 * the right trade for a club this size.
 *
 * @returns false when the DNI has already used its allowance.
 */
export function recordRenewalSend(dni: string, now = Date.now()): boolean {
  const recent = (sendTimes.get(dni) ?? []).filter(
    (sentAt) => now - sentAt < WINDOW_MS,
  );

  if (recent.length >= MAX_SENDS_PER_WINDOW) {
    sendTimes.set(dni, recent);
    return false;
  }

  sendTimes.set(dni, [...recent, now]);
  return true;
}
