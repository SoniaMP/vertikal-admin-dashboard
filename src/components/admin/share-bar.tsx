/**
 * The one proportion a strip draws, in the club's green: the only colour on
 * a screen whose chrome is ink. A zero has no stub.
 */
export function ShareBar({ percent }: { percent: number }) {
  return (
    <div className="mt-2 h-[3px] bg-[var(--rule)]">
      <div
        className="h-full bg-[var(--club)]"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
