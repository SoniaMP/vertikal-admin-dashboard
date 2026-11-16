import { getMembershipFee, getNotificationEmails } from "@/lib/settings";
import { getEmailBranding } from "@/lib/email-branding";
import { MembershipFeeForm } from "@/components/admin/membership-fee-form";
import { EmailBrandingForm } from "@/components/admin/email-branding-form";
import { NotificationEmailsForm } from "@/components/admin/notification-emails-form";
import { SettingsSection } from "@/components/admin/settings-section";

export default async function AjustesPage() {
  const [membershipFeeCents, branding, membershipEmails, courseEmails] =
    await Promise.all([
      getMembershipFee(),
      getEmailBranding(),
      getNotificationEmails("membership"),
      getNotificationEmails("course"),
    ]);
  const membershipFeeEuros = membershipFeeCents / 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Ajustes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lo que el club cobra, cómo se ven sus correos y quién se entera de
          cada alta.
        </p>
      </div>

      <SettingsSection
        title="Cuota de socio"
        description="Lo que paga cada socio por pertenecer al club, antes de cualquier licencia federativa. Solo afecta a las altas nuevas: las ya cobradas guardan el precio que tenían."
      >
        <MembershipFeeForm currentFeeEuros={membershipFeeEuros} />
      </SettingsSection>

      <SettingsSection
        title="Marca de los correos"
        description="El logo y los colores con los que salen los emails de confirmación de altas y de cursos."
      >
        <EmailBrandingForm branding={branding} />
      </SettingsSection>

      <SettingsSection
        title="Avisos de altas de socio"
        description="Quién recibe un correo cada vez que alguien se da de alta o renueva. Si la lista está vacía, no se envía ningún aviso al club."
      >
        <NotificationEmailsForm
          settingKey="membership"
          label="Direcciones avisadas"
          initialEmails={membershipEmails}
        />
      </SettingsSection>

      <SettingsSection
        title="Avisos de inscripciones a cursos"
        description="Quién recibe un correo cada vez que alguien se inscribe a un curso. Normalmente, quien lo dirige."
      >
        <NotificationEmailsForm
          settingKey="course"
          label="Direcciones avisadas"
          initialEmails={courseEmails}
        />
      </SettingsSection>
    </div>
  );
}
