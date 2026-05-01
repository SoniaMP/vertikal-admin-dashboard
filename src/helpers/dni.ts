export function normalizeDni(dni: string): string {
  return dni.trim().toUpperCase().replace(/[\s\-_.]/g, "");
}
