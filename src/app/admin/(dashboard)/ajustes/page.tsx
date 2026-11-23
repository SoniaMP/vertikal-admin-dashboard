import {
  getMembershipFee,
  getNotificationEmails,
  getSeasonRolloverDays,
} from "@/lib/settings";
import { formatRolloverWindow } from "@/helpers/rollover-window-label";
import { getEmailBranding } from "@/lib/email-branding";
import { MembershipFeeForm } from "@/components/admin/membership-fee-form";
import { EmailBrandingForm } from "@/components/admin/email-branding-form";
import { NotificationEmailsForm } from "@/components/admin/notification-emails-form";
import { SeasonRolloverForm } from "@/components/admin/season-rollover-form";
import { SettingsSection } from "@/components/admin/settings-section";

export default async function AjustesPage() {
  const [membershipFeeCents, branding, membershipEmails, courseEmails, rolloverDays] =
    await Promise.all([
      getMembershipFee(),
      getEmailBranding(),
      getNotificationEmails("membership"),
      getNotificationEmails("course"),
      getSeasonRolloverDays(),
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
        title="Relevo de temporada"
        description="La temporada es el año natural, y se calcula sola: no hay que crearla ni marcarla. Lo único que se configura es cuántos días antes de fin de año una alta ya cuenta para la temporada siguiente, que es cuando la gente empieza a apuntarse."
      >
        <SeasonRolloverForm
          currentDays={rolloverDays}
          windowLabel={formatRolloverWindow(new Date(), rolloverDays)}
        />
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
