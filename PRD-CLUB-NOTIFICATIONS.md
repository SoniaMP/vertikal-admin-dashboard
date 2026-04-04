# PRD: Club Notification Emails

## Problem Statement

When a member registers or enrolls in a course, only the user receives a confirmation email. The club staff (admins, treasurers, course coordinators) have no automated way to know that a new registration happened. They must manually check the admin panel, which causes delays in operational tasks like processing federation licenses or managing course spots.

## Solution

Extend the existing email infrastructure to send notification emails to configurable lists of club recipients whenever a membership or course registration payment completes. Provide an admin UI to manage these recipient lists independently (different people may care about memberships vs. courses). Show a visual warning when no recipients are configured.

## User Stories

### US-1: Configure membership notification emails

**As** a club administrator,
**I want** to add and remove email addresses that receive notifications when a user registers as a member,
**so that** the people responsible for managing registrations are informed in real time.

**Acceptance criteria:**
- A section "Emails de notificacion — Membresias" appears in `/admin/ajustes`
- I can type an email, press Enter, and it appears as a validated chip
- If the email format is invalid, an error is shown and the chip is not added
- I can remove an email by clicking the X on the chip
- Changes are saved when clicking "Guardar"
- Persisted in `AppSetting` with key `MEMBERSHIP_NOTIFICATION_EMAILS` as a JSON array

### US-2: Configure course notification emails

**As** a club administrator,
**I want** to configure a separate email list for course registration notifications,
**so that** course coordinators only receive the notifications relevant to them.

**Acceptance criteria:**
- A section "Emails de notificacion — Cursos" appears in `/admin/ajustes`
- Same chip behavior as US-1
- Persisted with key `COURSE_NOTIFICATION_EMAILS` as a JSON array
- Independent from the membership list

### US-3: Send notification to club on membership registration

**As** the club,
**I want** to receive an email with the member's details when they complete registration and payment,
**so that** I can process their federation license without manually checking the admin panel.

**Acceptance criteria:**
- After successful payment (Stripe webhook), an email is sent to all recipients configured in `MEMBERSHIP_NOTIFICATION_EMAILS`
- The email includes: full name, DNI, email, phone, address (city, postal code, province), license type, supplements, total amount, and season
- The email uses the configured branding (logo, colors)
- If the list is empty, nothing is sent and no error is produced

### US-4: Send notification to club on course registration

**As** the club,
**I want** to receive an email with the student's details when they complete a course registration and payment,
**so that** I can manage the spot and contact the student if needed.

**Acceptance criteria:**
- After successful payment (Stripe webhook), an email is sent to all recipients configured in `COURSE_NOTIFICATION_EMAILS`
- The email includes: full name, DNI, email, phone, course title, price tier/name, and amount
- The email uses the configured branding
- If the list is empty, nothing is sent and no error is produced

### US-5: Visual warning when no notification emails are configured

**As** a club administrator,
**I want** to see a warning on the settings page when a notification email list is empty,
**so that** I know notifications are not being sent and can fix it.

**Acceptance criteria:**
- If `MEMBERSHIP_NOTIFICATION_EMAILS` is empty, a yellow banner shows: "No hay emails configurados para notificaciones de membresias"
- If `COURSE_NOTIFICATION_EMAILS` is empty, an equivalent banner for courses
- The banner disappears as soon as at least one email is added and saved

## Implementation Decisions

### Storage
- Reuse the existing `AppSetting` key-value table. Two new keys: `MEMBERSHIP_NOTIFICATION_EMAILS` and `COURSE_NOTIFICATION_EMAILS`. Values stored as JSON arrays (`["a@b.com","c@d.com"]`). This is consistent with how branding settings are stored and avoids schema migrations.

### Settings retrieval
- New function `getNotificationEmails(type: "membership" | "course")` in the settings layer. Returns `string[]` (empty array if key missing or invalid JSON). Follows the same pattern as `getMembershipFee()` and `getEmailBranding()`.

### Admin UI
- New reusable `NotificationEmailsForm` component using chip-based input. Two instances on the settings page: one for memberships, one for courses. Each form is a client component with `useActionState()`, following the existing pattern from `MembershipFeeForm` and `EmailBrandingForm`.
- Chip input: text field where typing an email and pressing Enter validates format (Zod `z.string().email()`), adds chip if valid, shows inline error if not. Each chip displays the email with an X button to remove.
- Warning banners rendered server-side on the settings page, based on current DB values.

### Email templates
- Two new React Email templates: `club-membership-notification.tsx` and `club-course-notification.tsx`. These are operational/informational emails for the club, containing more data than the user-facing confirmations (DNI, phone, address). They use the same `EmailLayout` and branding system.

### Email sending
- Two new functions: `sendClubMembershipNotification(membershipId)` and `sendClubCourseNotification(registrationId)`. They read the recipient list from settings, skip silently if empty, fetch the relevant data, render the template, and send via Resend with all recipients in the `to` field.
- Called from the Stripe webhook handler alongside the existing confirmation emails, wrapped in `trySendEmail()` for error tolerance.

### Resend multi-recipient
- Resend API supports multiple recipients in the `to` field as an array. One API call per notification type, not one per recipient.

## MVP Scope

### Included
- Chip-based email list management for memberships and courses (two independent lists)
- Two new club notification email templates with operational data
- Automatic sending on payment completion via Stripe webhook
- Yellow warning banners on settings page when lists are empty
- Email validation (format) on input
- New notification templates registered in the email preview system for testing

### Excluded
- Role/group-based notification routing (single flat list per type)
- Notification preferences per recipient (all-or-nothing)
- Email delivery status tracking or retry logic beyond Resend's built-in
- SMS or other notification channels
- Notification for failed payments or cancellations
- Per-course notification lists (one global list for all courses)

## Risks

### Technical
- **Resend rate limits:** If many registrations happen simultaneously, bulk `to` recipients are fine (single API call), but many concurrent webhooks could hit rate limits. Mitigation: Resend's free tier allows 100 emails/day, paid tier is generous. Current volume is likely low.
- **JSON storage fragility:** Storing arrays as JSON strings in a text field means a malformed value breaks reads. Mitigation: `getNotificationEmails()` returns empty array on parse failure — never blocks the user flow.

### Product
- **Admin forgets to configure:** The warning banner mitigates this. Additionally, the first few registrations going unnotified is acceptable since membership status starts as unfederated and must be manually processed anyway.

### Adoption
- **Low risk:** This is a behind-the-scenes feature. Admins configure it once and forget. No user-facing changes.

## Testing Strategy

- **Settings functions:** Unit tests for `getNotificationEmails()` — valid JSON array, empty string, missing key, malformed JSON, empty array.
- **Server actions:** Unit tests for `updateNotificationEmails` — valid emails, invalid emails, empty list, duplicate emails.
- **Email sending:** Unit tests for `sendClubMembershipNotification` and `sendClubCourseNotification` — mock Resend, verify correct recipients, verify skip when list is empty, verify correct template data.
- **Chip input component:** Component tests for add/remove/validation behavior.
- **Integration:** Manual test of full flow: configure emails in settings, complete a Stripe test payment, verify both user and club emails arrive.

## Out of Scope

- Customizing the club notification email content from the admin UI
- Sending notifications for events other than successful payments (e.g., cancellations, expirations)
- Separate notification lists per individual course
- Role-based or permission-based notification routing
- Email open/click tracking

## Next Steps

1. Implement settings layer: `getNotificationEmails()` function + server action for saving
2. Build `NotificationEmailsForm` chip component + integrate into `/admin/ajustes`
3. Add warning banners to settings page
4. Create club notification email templates (membership + course)
5. Add send functions and wire into Stripe webhook handler
6. Register new templates in email preview system
7. Write tests
8. Manual end-to-end test with Stripe test mode
