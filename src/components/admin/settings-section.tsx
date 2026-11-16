type SettingsSectionProps = {
  title: string;
  /** What this setting changes, in the words of the club. */
  description: string;
  children: React.ReactNode;
};

/**
 * One setting per row: what it is on the left, the controls on the right,
 * with a rule between sections. The four settings used to be four forms
 * stacked with nothing to say which was which.
 */
export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="grid gap-5 border-t pt-8 md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-lg bg-muted p-4">{children}</div>
    </section>
  );
}
