# Roadmap

## Table of Contents

| Feature                                                       | Status    | Stories        |
| ------------------------------------------------------------- | --------- | -------------- |
| [Club Notification Emails](#feature-club-notification-emails) | COMPLETED | US-N1 to US-N4 |
| [Instructor Role](#feature-instructor-role)                   | IN PROGRESS | US-01 to US-12 |
| [Email Branding](#feature-email-branding)                     | COMPLETED | US-E1          |
| [Course Registration UX](#feature-course-registration-ux)     | COMPLETED | US-C1          |
| [License Files Security](#feature-license-files-security)     | PENDING   | US-S1 to US-S6 |
| [Pending Payment Recovery](#feature-pending-payment-recovery) | PENDING   | US-P1 to US-P3 |

---

## Feature: Club Notification Emails

**Status:** COMPLETED

Admin notification system for membership and course enrollments.

<details>
<summary>US-N1: Notification settings backend</summary>

> As an admin, I want to configure which email addresses receive enrollment
> notifications so that the right people are informed.

- [x] `getNotificationEmails()` in `src/lib/settings.ts`
- [x] `updateNotificationEmails` server action in `src/app/admin/(dashboard)/ajustes/actions.ts`
- [x] Unit tests for settings + action

</details>

<details>
<summary>US-N2: Notification email UI in admin settings</summary>

> As an admin, I want to manage notification recipients from the settings page
> with a user-friendly chip input.

- [x] `EmailChipInput` component (`src/components/admin/email-chip-input.tsx`)
- [x] `NotificationEmailsForm` component (`src/components/admin/notification-emails-form.tsx`)
- [x] Warning banners when email lists are empty
- [x] Integrated into `/admin/ajustes` page
- [x] Component tests for chip input

</details>

<details>
<summary>US-N3: Notification email templates</summary>

> As an admin, I want enrollment notification emails to contain all relevant
> member/enrollee data so I can process registrations without opening the panel.

- [x] `club-membership-notification.tsx` template (name, DNI, email, phone, address, license, supplements, total, season)
- [x] `club-course-notification.tsx` template (name, DNI, email, phone, course, price tier, amount)
- [x] Both registered in email preview system

</details>

<details>
<summary>US-N4: Notification sending via Stripe webhook</summary>

> As an admin, I want notifications sent automatically when a payment completes
> so I don't miss any enrollment.

- [x] `sendClubMembershipNotification()` in `src/lib/send-notification-email.ts`
- [x] `sendClubCourseNotification()` in `src/lib/send-notification-email.ts`
- [x] Both wired into Stripe webhook `handleCheckoutCompleted()`
- [x] Tests for send functions (success + skip-when-empty)

> **Note:** Stripe webhook test does not assert notification calls are made —
> functions are tested in isolation only. Minor coverage gap.

</details>

---

## Feature: Instructor Role

**Status:** IN PROGRESS

Instructors are course directors who use the club's platform to create, manage,
and track their courses and enrollees. They log in through the same admin panel
but see a scoped view limited to their own courses.

<details>
<summary>Decisions</summary>

- One instructor per course (FK on `CourseCatalog`, no join table)
- Instructor sees only their own courses and enrollees (strict isolation)
- Full CRUD on courses including price
- Approval flow: DRAFT -> ACTIVE (admin approves) -> INACTIVE. Reactivation requires admin
- Edits on ACTIVE courses do not require re-approval
- Full PII exposure to instructors (DNI, address, DOB) — required for federation paperwork and certificates
- Instructor can export their own course enrollees
- Instructor receives email notification on enrollment
- Admin creates instructor accounts from admin panel with temporary password
- Instructor nav: "Mis Cursos" + "Mi Cuenta"
- Admin retains full visibility and override power across all courses

</details>

<details>
<summary>US-01: Schema changes for Instructor role</summary>

> As a developer, I need the data model to support instructors and course statuses
> so that the rest of the feature can be built on solid foundations.

- [x] Add `INSTRUCTOR` to seeded roles
- [x] Add `instructorId` (nullable FK to `User`) on `CourseCatalog`
- [x] Replace `active` boolean on `CourseCatalog` with `status` enum (DRAFT, ACTIVE, INACTIVE)
- [x] Migrate existing courses: `active=true` -> ACTIVE, `active=false` -> INACTIVE
- [x] Update Prisma schema, generate client, create and apply migration
- [x] Update existing queries that reference `active` to use `status`

</details>

<details>
<summary>US-02: Admin can create and manage instructor accounts</summary>

> As an admin, I want to create instructor accounts from the admin panel
> so that instructors can log in without needing CLI access.

- [x] User management page in admin (`/admin/usuarios`)
- [x] Form: name, email, password, role selection (ADMIN / INSTRUCTOR)
- [x] List of existing users with role badges
- [x] Edit user (name, email, role)
- [x] Reset password for a user (via edit form, optional password field)
- [x] Delete user (with confirmation, self-deletion prevented)

</details>

<details>
<summary>US-03: Role-based navigation and middleware</summary>

> As a user (admin or instructor), I want to see only the nav items relevant to
> my role so that the interface is not confusing.

- [x] Update middleware to check role and allow access accordingly
- [x] Admin nav: full menu (as today) + "Usuarios" section
- [x] Instructor nav: only "Cursos" visible (Mis Cursos and Mi Cuenta come in US-04/US-08)
- [x] Redirect instructor away from admin-only routes (registros, ajustes, etc.)
- [x] Show current user name and role badge in sidebar

</details>

<details>
<summary>US-04: Instructor can create and edit courses</summary>

> As an instructor, I want to create and fully manage my courses
> so that I can set up offerings for the club's students.

- [x] "Mis Cursos" page listing only courses where `instructorId = currentUser`
- [x] Create course form (reuses existing form, instructorId set server-side)
- [x] New course defaults to DRAFT status (instructor-created)
- [x] Edit course form (same fields, available in any status, ownership enforced)
- [x] Delete restricted to admin only (softDeleteCourse requires ADMIN)

</details>

<details>
<summary>US-05: Admin approves courses</summary>

> As an admin, I want to review and approve instructor-created courses
> so that only vetted courses appear on the public site.

- [x] Admin course list shows all courses with status and instructor name
- [x] Filter by status (DRAFT/ACTIVE/INACTIVE) available in toolbar
- [x] Inline status select: approve (DRAFT -> ACTIVE), deactivate, reactivate
- [x] Admin can edit any course regardless of instructor

</details>

<details>
<summary>US-06: Instructor views and exports enrollees</summary>

> As an instructor, I want to see who enrolled in my courses and export that data
> so that I can handle federation paperwork and issue certificates.

- [x] Enrollee list per course (name, email, phone, DNI, DOB, payment status badge)
- [x] Only visible for courses where `instructorId = currentUser` (ownership guard)
- [x] Export enrollees to CSV (address, city, postal code, province, payment status added)
- [x] Export route secured with auth + instructor ownership check
- [x] Admin can see enrollees for any course (existing behavior)

</details>

<details>
<summary>US-07: Instructor receives enrollment notifications</summary>

> As an instructor, I want to receive an email when someone enrolls in my course
> so that I stay informed without checking the panel constantly.

- [x] When a course has an instructor, send notification to `instructor.email`
- [x] Fall back to global `COURSE_NOTIFICATION_EMAILS` for courses without instructor
- [x] Reuses existing email template (course name, enrollee name, amount)
- [x] Admin membership notifications unchanged (global list)
- [x] Tests updated: new test for instructor recipient, existing tests fixed

</details>

<details>
<summary>US-08: Instructor account page (Mi Cuenta)</summary>

> As an instructor, I want to change my password
> so that I can secure my account after receiving a temporary password.

- [x] "Mi Cuenta" page at `/admin/cuenta`, accessible to both roles
- [x] Change password form (current password + new password + confirm)
- [x] Display account info (name, email, role) — read-only
- [x] Nav item visible to both roles, middleware allows instructor access

</details>

<details>
<summary>US-09: Public site respects course status</summary>

> As a visitor, I should only see ACTIVE courses on the public site
> so that I cannot register for courses that are not approved.

- [x] Update `/cursos` page query: filter by `status = ACTIVE` (done in US-01)
- [x] Stripe checkout creation rejects non-ACTIVE courses (done in US-01)
- [x] Course detail page returns 404 for non-ACTIVE courses (done in US-01)

</details>

<details>
<summary>US-10: Instructor can remove a course enrollee</summary>

> As an instructor, I want to remove a participant from my course
> so that I can manage enrollment when someone cancels or was registered by mistake.

- [x] Add delete action on enrollee row (confirmation dialog required)
- [x] Ownership guard: only the course instructor or an admin can delete
- [x] Handle Stripe refund consideration (inform user, no automatic refund)
- [x] Update enrollee count after deletion (via `revalidatePath`)
- [x] Tests for delete action and ownership guard

</details>

<details>
<summary>US-11: Instructor or admin can add a course participant manually</summary>

> As an instructor or admin, I want to manually add a participant to a course
> so that I can register people who sign up in person, by phone, or outside the
> online flow.

**Decisions:**
- New `paymentStatus` value `MANUAL` — distinguishes from PENDING (Stripe waiting) and COMPLETED (Stripe paid)
- `getCourseAvailableSpots()` counts COMPLETED + MANUAL toward capacity
- `fetchCourseParticipants()` and `fetchAllCourseParticipants()` remove `paymentStatus: "COMPLETED"` filter — show all statuses
- Required fields: firstName, lastName, email, coursePriceId
- Optional fields collapsed under "Datos adicionales": DNI, dateOfBirth, phone, address, city, postalCode, province, licenseType, licenseFileUrl
- UI: dialog modal in participants section, next to "Exportar" button
- No Stripe checkout, no confirmation email
- Ownership guard: course instructor or admin (same pattern as US-10)

**Tasks:**
- [x] Update queries: remove paymentStatus filter, count MANUAL toward capacity
- [x] Add MANUAL badge style to participant rows (desktop + mobile)
- [x] Create validation schema for manual registration (minimal required fields)
- [x] Create `addEnrollee` server action with ownership guard + capacity check
- [x] Create add-participant dialog with collapsible optional fields
- [x] Tests for action, ownership guard, and capacity validation

</details>

<details>
<summary>US-12: Instructor or admin can edit a course participant</summary>

> As an instructor or admin, I want to edit a participant's data
> so that I can correct mistakes or complete missing information.

- [ ] Create `updateEnrollee` server action with ownership guard
- [ ] Reuse add-participant dialog in edit mode (pre-filled with current data)
- [ ] Edit button on each participant row (desktop + mobile)
- [ ] Tests for update action and ownership guard

</details>

---

## Feature: Email Branding

**Status:** COMPLETED

Ensure the club logo renders correctly in all transactional emails.

<details>
<summary>US-E1: Logo visible in emails</summary>

> As a club member or enrollee, I want to see the club logo in confirmation
> emails so that the communication looks professional and trustworthy.

- [x] Prefix `AUTH_URL` to relative logo path in `getEmailBranding()` so emails contain an absolute public URL
- [x] Verify `/api/uploads/branding/` is not blocked by auth middleware for external requests
- [x] Test with a real email client (Gmail, Outlook) to confirm image renders

</details>

---

## Feature: Course Registration UX

**Status:** COMPLETED

Improve the course registration flow with a pre-payment review step, consistent
with the membership registration wizard.

<details>
<summary>US-C1: Course registration wizard with summary step</summary>

> As a course enrollee, I want to review my data and the selected price before
> paying so that I can confirm everything is correct.

- [x] Convert single-step course form into a 2-step wizard (step 1: form, step 2: summary)
- [x] Summary displays: personal data, selected course, selected price tier, total amount
- [x] "Anterior" button to go back and edit
- [x] Privacy policy acceptance checkbox (RGPD) required before "Proceder al pago"
- [x] "Proceder al pago" button redirects to Stripe checkout (existing flow)

</details>

---

## Feature: License Files Security

**Status:** PENDING

Course enrollees upload a federation license PDF during the public registration
wizard. Today the upload endpoint is unauthenticated and the download endpoint
is also public — anyone with a UUID URL can read sensitive personal data (DNI,
date of birth, photo). This feature closes that gap and aligns the storage and
lifecycle of these files with GDPR principles.

<details>
<summary>Decisions</summary>

**Access and authorization**
- Enrollees never re-download their own PDF. Once uploaded, the file is strictly internal.
- Download URL is keyed by `CourseRegistration.id`, not by file name: `GET /api/admin/course-registrations/<id>/license`.
- DB field `licenseFileUrl` is renamed to `licenseFileKey` and stores only the physical filename (`<uuid>.pdf`), never a public URL.
- Authorization on each download: valid session AND (role ADMIN) OR (role INSTRUCTOR AND `course.instructorId === session.user.id`). No historical access — if an instructor loses a course, they lose access immediately.
- No download audit log (out of scope for a small association).

**Upload endpoint hardening (stays public)**
- Rate limit: 5 uploads per IP per 10 minutes, in-memory (single VPS instance, no external dependency).
- Max file size lowered from 10 MB to 5 MB.
- Magic number validation: first bytes must be `%PDF-`, not just the client-declared MIME type.

**Storage**
- Physical files live outside the repo, under a path configured by env var `UPLOADS_DIR` (e.g. `/var/lib/vertikal/uploads` in production, `data/uploads/` in local).

**Download UI**
- "Ver adjunto" button in the participants table on the course detail page, visible only when the participant has a file.
- Preview in a new tab (`Content-Disposition: inline`), not forced download.
- Response includes `X-Content-Type-Options: nosniff`.

**Lifecycle and GDPR**
- Cascade delete: when a `CourseRegistration` is deleted, its PDF is removed from disk.
- Retention: PDFs are deleted automatically 6 months after the course end date.
- Nightly cron job on the VPS handles two cleanups: orphan files (>24 h on disk with no associated `CourseRegistration`) and expired files (>6 months past course end date).

**Out of scope (deferred)**
- PDFs attached to `PENDING_PAYMENT` registrations that never complete are handled by the Pending Payment Recovery feature (US-P3), not here.

</details>

<details>
<summary>US-S1: Refactor schema and download URL to id-based authorization</summary>

> As a developer, I need the download flow to be keyed by registration id and
> protected by session-based authorization so that file location stops being a
> secret and access control becomes natural.

- [ ] Rename `CourseRegistration.licenseFileUrl` to `licenseFileKey` in Prisma schema (Prisma migration)
- [ ] Update `/api/upload` to return `{ key }` instead of `{ url }`
- [ ] Update `course-license-upload.tsx` and `validations/course.ts` to handle the new field
- [ ] Create `GET /api/admin/course-registrations/[id]/license` route with session + role + ownership checks
- [ ] Delete the old `/api/uploads/licenses/[filename]` route
- [ ] Tests for the new download route (admin OK, instructor own course OK, instructor other course 403, anonymous 401)

</details>

<details>
<summary>US-S2: Harden the public upload endpoint</summary>

> As an admin, I want the public upload endpoint to resist abuse and content
> spoofing so that the disk cannot be filled and no malicious file can be
> served back to the browser.

- [ ] In-memory rate limiter: 5 requests per IP per 10 min in `/api/upload`
- [ ] Lower max file size from 10 MB to 5 MB
- [ ] Validate magic number `%PDF-` on the first bytes of the uploaded buffer
- [ ] Reject with clear error messages when any check fails
- [ ] Tests for rate limit, size cap, and magic number validation

</details>

<details>
<summary>US-S3: Move file storage outside the repo</summary>

> As an admin, I want uploaded files to live outside the project directory so
> that deployments do not interfere with user data and backups can target a
> single known location.

- [ ] Add `UPLOADS_DIR` env var (default `data/uploads` for local)
- [ ] Replace hardcoded path in upload and download routes with the env var
- [ ] Document the production path (`/var/lib/vertikal/uploads`) and required permissions in README or `.env.example`
- [ ] Verify the directory is excluded from `.gitignore` and any deploy bundle

</details>

<details>
<summary>US-S4: "Ver adjunto" button in the participants table</summary>

> As an instructor or admin, I want to preview a participant's uploaded license
> directly from the course participants table so that I can verify federation
> paperwork without leaving the panel.

- [ ] Add "Ver adjunto" button on each participant row, visible only when `licenseFileKey` is set
- [ ] Button opens the download URL in a new tab
- [ ] Set `Content-Disposition: inline` and `X-Content-Type-Options: nosniff` on the response
- [ ] Visible in both desktop and mobile layouts
- [ ] Tests for visibility logic and link target

</details>

<details>
<summary>US-S5: Cascade delete of PDF when a registration is removed</summary>

> As an admin, I want a participant's PDF to be deleted from disk when their
> registration is removed so that no orphan personal data remains.

- [ ] Update the delete-participant server action to remove the file from disk after the DB row is deleted
- [ ] Handle the case where the file is already missing (idempotent, no error)
- [ ] Tests for cascade delete (file present, file missing)

</details>

<details>
<summary>US-S6: Nightly cleanup job (orphans and expired files)</summary>

> As an admin, I want abandoned and expired PDFs to be cleaned up automatically
> so that personal data does not accumulate beyond its retention period.

- [ ] Create `npm run cleanup-uploads` script that performs two passes:
  - Orphans: files in `UPLOADS_DIR` older than 24 h with no matching `licenseFileKey` in any `CourseRegistration`
  - Expired: files whose associated course ended more than 6 months ago (delete the DB row too, or just the file — to be decided in implementation)
- [ ] Document the cron entry to run nightly on the VPS
- [ ] Dry-run mode for safe verification (`--dry-run` flag)
- [ ] Tests for both passes against a temp directory

</details>

---

## Feature: Pending Payment Recovery

**Status:** PENDING

Today, course registrations that fail or abandon Stripe checkout stay in
`PENDING_PAYMENT` forever. Instructors have no way to rescue them and no signal
that something went wrong. This feature gives instructors the tools to recover
those enrollments and cleans up the ones that cannot be recovered.

<details>
<summary>US-P1: Manually mark a course registration as paid</summary>

> As an instructor or admin, I want to manually mark a pending course
> registration as paid so that I can recover enrollments where the participant
> failed the online payment but settled it offline.

- [ ] `markRegistrationAsPaid` server action with ownership guard (course instructor or admin)
- [ ] Action button on participant rows in `PENDING_PAYMENT` state
- [ ] Confirmation dialog before marking
- [ ] Tests for action and ownership guard

</details>

<details>
<summary>US-P2: Notify instructor when a payment fails or is abandoned</summary>

> As an instructor, I want to receive an email when a participant's payment
> fails or is abandoned so that I can reach out and resolve it before the
> registration is auto-deleted.

- [ ] Detect failed/abandoned Stripe sessions (webhook event `checkout.session.expired` or equivalent)
- [ ] Send email to course instructor with participant data and failure reason
- [ ] Reuse existing notification email infrastructure
- [ ] Tests for the new notification

</details>

<details>
<summary>US-P3: Auto-cleanup of unrecovered pending registrations</summary>

> As an admin, I want unresolved pending registrations to be cleaned up
> automatically after 5 days so that they do not accumulate indefinitely.

- [ ] Nightly job: delete `CourseRegistration` rows in `PENDING_PAYMENT` older than 5 days
- [ ] Cascade delete the associated license PDF (covered by the License Files Security feature)
- [ ] Tests for the cleanup logic

</details>
