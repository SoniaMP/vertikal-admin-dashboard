type RegistrationHeaderProps = {
  /** Defaults say what the alta is; the renewal passes its own words. */
  title?: string;
  lead?: string;
};

export function RegistrationHeader({
  title = "Registro de socio",
  lead = "Completa el formulario para registrarte en Club Vertikal",
}: RegistrationHeaderProps) {
  return (
    <>
      <h1 className="text-[length:var(--step-head)] font-semibold leading-none tracking-[-0.035em]">
        {title}
      </h1>
      <p className="mt-4 text-muted-foreground">{lead}</p>
    </>
  );
}
