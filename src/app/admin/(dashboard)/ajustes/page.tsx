import { getMembershipFee, getNotificationEmails } from "@/lib/settings";
import { getEmailBranding } from "@/lib/email-branding";
import { MembershipFeeForm } from "@/components/admin/membership-fee-form";
import { EmailBrandingForm } from "@/components/admin/email-branding-form";
import { NotificationEmailsForm } from "@/components/admin/notification-emails-form";
import { TriangleAlert } from "lucide-react";

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
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <NotificationEmailsBanner
        hasMembership={membershipEmails.length > 0}
        hasCourse={courseEmails.length > 0}
      />

      <MembershipFeeForm currentFeeEuros={membershipFeeEuros} />
      <EmailBrandingForm branding={branding} />

      <NotificationEmailsForm
        settingKey="membership"
        label="Emails de notificación de membresías"
        initialEmails={membershipEmails}
      />
      <NotificationEmailsForm
        settingKey="course"
        label="Emails de notificación de cursos"
        initialEmails={courseEmails}
      />
    </div>
  );
}

function NotificationEmailsBanner({
  hasMembership,
  hasCourse,
}: {
  hasMembership: boolean;
  hasCourse: boolean;
}) {
  const warnings: string[] = [];
  if (!hasMembership)
    warnings.push("No hay emails configurados para notificaciones de membresías");
  if (!hasCourse)
    warnings.push("No hay emails configurados para notificaciones de cursos");

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((msg) => (
        <div
          key={msg}
          className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
        >
          <TriangleAlert className="size-4 shrink-0" />
          {msg}
        </div>
      ))}
    </div>
  );
}
