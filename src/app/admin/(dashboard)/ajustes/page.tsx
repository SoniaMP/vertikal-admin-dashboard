import { getMembershipFee, getNotificationEmails } from "@/lib/settings";
import { getEmailBranding } from "@/lib/email-branding";
import { MembershipFeeForm } from "@/components/admin/membership-fee-form";
import { EmailBrandingForm } from "@/components/admin/email-branding-form";
import { NotificationEmailsForm } from "@/components/admin/notification-emails-form";

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
