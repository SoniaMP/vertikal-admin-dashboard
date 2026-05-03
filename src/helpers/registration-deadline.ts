export function endOfLocalDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 0);
  return result;
}

export function isRegistrationClosed(
  registrationDeadline: Date,
  now: Date = new Date(),
): boolean {
  return now > registrationDeadline;
}
