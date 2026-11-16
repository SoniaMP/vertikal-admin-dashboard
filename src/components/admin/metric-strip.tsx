/**
 * One container split by hairlines, not a row of tiles: the figures of a
 * season or of a course, side by side and sharing one frame.
 */
export function MetricStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
      {children}
    </div>
  );
}
