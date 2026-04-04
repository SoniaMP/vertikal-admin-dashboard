# Plan: Club Notification Emails

> PRD: `PRD-CLUB-NOTIFICATIONS.md`

## Phase 1: Settings Backend

### Task 1.1 — `getNotificationEmails()` (S)
- [ ] Add function to `src/lib/settings.ts`
- [ ] Accepts `type: "membership" | "course"`, reads from `AppSetting`, returns `string[]`
- [ ] Returns `[]` on missing key or invalid JSON
- Dependencies: none

### Task 1.2 — Server action `updateNotificationEmails` (S)
- [ ] Add to `src/app/admin/(dashboard)/ajustes/actions.ts`
- [ ] Receives `type` + JSON array from FormData
- [ ] Validates each email with Zod
- [ ] Upserts `AppSetting` key (`MEMBERSHIP_NOTIFICATION_EMAILS` or `COURSE_NOTIFICATION_EMAILS`)
- [ ] Follows existing pattern: `requireAuth()`, `revalidatePath()`, returns `ActionResult`
- Dependencies: 1.1

### Task 1.3 — Tests for settings + action (S)
- [ ] Unit tests for `getNotificationEmails()`: valid array, empty, missing key, malformed JSON
- [ ] Unit tests for `updateNotificationEmails`: valid emails, invalid, duplicates, empty list
- Dependencies: 1.1, 1.2

---

## Phase 2: Admin UI

### Task 2.1 — `EmailChipInput` component (M)
- [ ] Create reusable client component in `src/components/admin/email-chip-input.tsx`
- [ ] Input field + Enter to add + Zod `z.string().email()` validation
- [ ] Chip display with X button to remove
- [ ] Controlled: receives `value: string[]` + `onChange`
- [ ] Inline error message on invalid email
- Dependencies: none

### Task 2.2 — `NotificationEmailsForm` component (M)
- [ ] Create client component in `src/components/admin/notification-emails-form.tsx`
- [ ] Wraps `EmailChipInput` with `useActionState()`
- [ ] Props: `settingKey`, `label`, `initialEmails`
- [ ] Submit serializes array as JSON in hidden input, calls server action
- Dependencies: 2.1, 1.2

### Task 2.3 — Warning banners (S)
- [ ] In `ajustes/page.tsx`: read both email lists server-side
- [ ] Render yellow banner per empty list: "No hay emails configurados para notificaciones de membresias/cursos"
- [ ] Banner disappears when list has at least one email
- Dependencies: 1.1

### Task 2.4 — Integrate into `/admin/ajustes` (S)
- [ ] Add both `NotificationEmailsForm` instances to the settings page
- [ ] Load notification emails in the existing `Promise.all()`
- Dependencies: 2.2, 2.3

### Task 2.5 — Component tests for chip input (S)
- [ ] Add/remove chips, validation error on invalid email, Enter key behavior
- Dependencies: 2.1

---

## Phase 3: Email Templates

### Task 3.1 — `club-membership-notification.tsx` (M)
- [ ] Create React Email template in `src/emails/`
- [ ] Content: full name, DNI, email, phone, address (city, postal code, province), license type, supplements, total amount, season
- [ ] Uses `EmailLayout` + branding props
- Dependencies: none

### Task 3.2 — `club-course-notification.tsx` (M)
- [ ] Create React Email template in `src/emails/`
- [ ] Content: full name, DNI, email, phone, course title, price tier/name, amount
- [ ] Uses `EmailLayout` + branding props
- Dependencies: none

### Task 3.3 — Register in email preview (S)
- [ ] Add both templates to `src/app/api/email-preview/templates.ts` with sample props
- Dependencies: 3.1, 3.2

---

## Phase 4: Email Sending + Webhook

### Task 4.1 — `sendClubMembershipNotification()` (M)
- [ ] Add to `src/lib/send-email.ts`
- [ ] Read recipients via `getNotificationEmails("membership")`
- [ ] Skip silently if empty
- [ ] Fetch membership + member data (name, DNI, email, phone, address, license, supplements, total, season)
- [ ] Render with `renderBrandedEmail()`, send via Resend with all recipients in `to`
- Dependencies: 1.1, 3.1

### Task 4.2 — `sendClubCourseNotification()` (M)
- [ ] Add to `src/lib/send-email.ts`
- [ ] Read recipients via `getNotificationEmails("course")`
- [ ] Skip silently if empty
- [ ] Fetch course registration + catalog + price data
- [ ] Render with `renderBrandedEmail()`, send via Resend with all recipients in `to`
- Dependencies: 1.1, 3.2

### Task 4.3 — Wire into Stripe webhook (S)
- [ ] In `src/app/api/webhooks/stripe/route.ts` `handleCheckoutCompleted()`
- [ ] Call `sendClubMembershipNotification(membershipId)` alongside existing confirmation
- [ ] Call `sendClubCourseNotification(registrationId)` alongside existing confirmation
- [ ] Both wrapped in `trySendEmail()` for error tolerance
- Dependencies: 4.1, 4.2

### Task 4.4 — Tests for send functions (M)
- [ ] Mock Resend, verify correct recipients and template data
- [ ] Verify skip when list is empty
- [ ] Verify error tolerance (no throw)
- Dependencies: 4.1, 4.2

---

## Execution Order

Parallel tracks to maximize speed:

```
Track A (backend):  1.1 → 1.2 → 1.3
Track B (UI):       2.1 → 2.2 → 2.4 → 2.5
Track C (emails):   3.1 + 3.2 → 3.3
                         ↓
                    4.1 + 4.2 → 4.3 → 4.4
```

- Tracks A, B, C start in parallel
- Phase 4 starts when Phase 1 + Phase 3 are done
- Task 2.3 (banners) and 2.4 (integration) need Phase 1 done
- Final: manual E2E test with Stripe test mode

## Key Files Modified

| File | Change |
|---|---|
| `src/lib/settings.ts` | Add `getNotificationEmails()` |
| `src/app/admin/(dashboard)/ajustes/actions.ts` | Add `updateNotificationEmails` action |
| `src/app/admin/(dashboard)/ajustes/page.tsx` | Load emails, render forms + banners |
| `src/components/admin/email-chip-input.tsx` | New component |
| `src/components/admin/notification-emails-form.tsx` | New component |
| `src/emails/club-membership-notification.tsx` | New template |
| `src/emails/club-course-notification.tsx` | New template |
| `src/app/api/email-preview/templates.ts` | Register new templates |
| `src/lib/send-email.ts` | Add `sendClubMembershipNotification()`, `sendClubCourseNotification()` |
| `src/app/api/webhooks/stripe/route.ts` | Wire new send calls |
