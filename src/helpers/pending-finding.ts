/**
 * The one line under the screen's title: what in this season's data most
 * needs someone's attention. Unpaid registrations are it — they are the only
 * rows that cost the club money if nobody looks.
 */
export function formatPendingFinding(
  count: number,
  oldest: Date | null,
): string {
  if (count === 0) {
    return "Todas las altas de la temporada están cobradas.";
  }

  const since = oldest ? ` La más antigua es del ${formatDay(oldest)}.` : "";

  return count === 1
    ? `1 alta sigue sin cobrar.${since}`
    : `${count} altas siguen sin cobrar.${since}`;
}

function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
  }).format(date);
}
