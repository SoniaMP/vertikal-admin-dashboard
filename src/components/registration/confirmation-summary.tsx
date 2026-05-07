import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/helpers/price-calculator";
import type { MembershipConfirmation } from "@/lib/stripe-confirm";

type ConfirmationSummaryProps = {
  data: MembershipConfirmation;
};

export function ConfirmationSummary({ data }: ConfirmationSummaryProps) {
  const { member } = data;
  const fullAddress = `${member.address}, ${member.postalCode} ${member.city} (${member.province})`;

  return (
    <div className="w-full max-w-md space-y-4 text-left">
      <ConfirmationSection title="Datos personales">
        <ConfirmationRow
          label="Nombre"
          value={`${member.firstName} ${member.lastName}`}
        />
        <ConfirmationRow label="Email" value={member.email} />
        <ConfirmationRow label="Teléfono" value={member.phone} />
        <ConfirmationRow label="DNI" value={member.dni} />
        <ConfirmationRow
          label="Fecha de nacimiento"
          value={member.dateOfBirth}
        />
        <ConfirmationRow
          label="Sexo"
          value={member.sex === "M" ? "Hombre" : member.sex === "F" ? "Mujer" : ""}
        />
        <ConfirmationRow label="Dirección" value={fullAddress} />
      </ConfirmationSection>

      <Separator />

      <ConfirmationSection title="Licencia">
        <ConfirmationRow label="Tipo" value={data.licenseLabel} />
        {data.supplements.length > 0 && (
          <ConfirmationRow
            label="Suplementos"
            value={data.supplements.map((s) => s.name).join(", ")}
          />
        )}
        <ConfirmationRow
          label="Total pagado"
          value={formatPrice(data.totalAmount)}
        />
      </ConfirmationSection>
    </div>
  );
}

type ConfirmationSectionProps = {
  title: string;
  children: React.ReactNode;
};

function ConfirmationSection({ title, children }: ConfirmationSectionProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

type ConfirmationRowProps = {
  label: string;
  value: string;
};

function ConfirmationRow({ label, value }: ConfirmationRowProps) {
  return (
    <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
