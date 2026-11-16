type MetricProps = {
  label: string;
  value: string;
  /** The figure this one is part of ("de 20"), in grey beside the value. */
  suffix?: string;
  /** A share bar or a note, directly under the value. */
  children?: React.ReactNode;
};

/** Label above, value below, in tabular digits so the columns line up. */
export function Metric({ label, value, suffix, children }: MetricProps) {
  return (
    <div className="bg-card px-5 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-medium tracking-tight tabular-nums">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
      {children}
    </div>
  );
}
