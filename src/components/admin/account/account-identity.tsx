type AccountIdentityProps = {
  name: string;
  email: string;
  roleLabel: string;
};

/**
 * What the panel knows about whoever is signed in: label left, value right,
 * one row apiece. Read-only, because these are edited from Usuarios.
 */
export function AccountIdentity({
  name,
  email,
  roleLabel,
}: AccountIdentityProps) {
  return (
    <dl className="text-sm">
      <Row label="Nombre" value={name} />
      <Row label="Email" value={email} />
      <Row label="Rol" value={roleLabel} />
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-border py-2 not-first:border-t">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
