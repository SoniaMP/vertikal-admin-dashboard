const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EARLIEST_BIRTH_DATE = "1900-01-01";

/**
 * `new Date` happily rolls 31 February over into March, so a round trip is what
 * actually proves the day exists. UTC keeps the comparison away from the
 * timezone the server happens to run in.
 */
function isRealCalendarDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

/** Today where the club is, as `YYYY-MM-DD`, for comparing dates as strings. */
function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Why a birth date is unusable, or null when it is fine. Kept separate from the
 * schema so the rules can be read and tested without Zod, and so the form and
 * the API cannot end up disagreeing about what a date is.
 *
 * The date picker in the browser already blocks most of this; the API does not
 * have one, and it is the API that writes to the database. Age categories price
 * the license off this field, so garbage here is wrong money later.
 */
export function birthDateError(value: string): string | null {
  if (value.length === 0) return "La fecha de nacimiento es obligatoria";

  if (!ISO_DATE_PATTERN.test(value) || !isRealCalendarDate(value)) {
    return "Introduce una fecha de nacimiento válida";
  }
  if (value > todayIsoDate()) {
    return "La fecha de nacimiento no puede estar en el futuro";
  }
  if (value < EARLIEST_BIRTH_DATE) {
    return "Revisa el año de nacimiento";
  }
  return null;
}
