# Roadmap

## Table of Contents

| Feature                                                                                                       | Status      | Stories         |
| ------------------------------------------------------------------------------------------------------------- | ----------- | --------------- |
| [Club Notification Emails](#feature-club-notification-emails)                                                 | COMPLETED   | US-N1 to US-N4  |
| [Instructor Role](#feature-instructor-role)                                                                   | IN PROGRESS | US-01 to US-12  |
| [Email Branding](#feature-email-branding)                                                                     | COMPLETED   | US-E1           |
| [Course Registration UX](#feature-course-registration-ux)                                                     | COMPLETED   | US-C1           |
| [License Files Security](#feature-license-files-security)                                                     | PENDING     | US-S1 to US-S6  |
| [Pending Payment Recovery](#feature-pending-payment-recovery)                                                 | PENDING     | US-P1 to US-P3  |
| [Membership Fee and Federation Price Decoupling](#feature-membership-fee-and-federation-price-decoupling)     | PENDING     | US-FM1 to US-FM4 |
| [Season as Year-of-Validity](#feature-season-as-year-of-validity)                                             | PENDING     | US-SY1 to US-SY3 |
| [Course Registration Deadline](#feature-course-registration-deadline)                                         | PENDING     | US-CD1 to US-CD3 |
| [DNI Normalization and Uniqueness](#feature-dni-normalization-and-uniqueness)                                 | PENDING     | US-DN1 to US-DN3 |
| [RGPD Dialog Gate](#feature-rgpd-dialog-gate)                                                                 | PENDING     | US-RG1          |
| [Course Participant Editing and Price Snapshot](#feature-course-participant-editing-and-price-snapshot)       | PENDING     | US-CP1 to US-CP4 |
| [UX Polish](#feature-ux-polish)                                                                               | PENDING     | US-UX1 to US-UX3 |
| [Active Member Discount on Courses](#feature-active-member-discount-on-courses)                               | DEFERRED    | US-AD1          |

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
<summary>US-12: Instructor or admin can edit a course participant — SUPERSEDED by US-CP2</summary>

> As an instructor or admin, I want to edit a participant's data
> so that I can correct mistakes or complete missing information.

> **Note:** Superseded by US-CP2 in the "Course Participant Editing and Price
> Snapshot" feature. The expanded scope adds price-tier editing and a
> `CourseRegistration.amountSnapshot` field; track the work there instead.

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

---

## Feature: Membership Fee and Federation Price Decoupling

**Status:** PENDING

Today, `Membership.totalAmount` bundles the membership fee, the federation
price, and supplements into a single number. There is no way to break income
down into "club fees" vs. "federation fees" for reporting, and manually-created
memberships (gifted to selected members) cannot represent the case where the
club absorbs the cost while the value is still consumed against the season
totals. This feature splits the snapshot, adds a manual-creation flow with
catalog-driven pricing, and exposes the income breakdown the board needs.

<details>
<summary>Decisions</summary>

**Schema and snapshots**
- Add `Membership.socioFeeSnapshot: Int` (snapshot of `MEMBERSHIP_FEE` at creation time, immutable).
- `Membership.licensePriceSnapshot` keeps its current role (snapshot of selected `LicenseOffering.price`).
- Add `MANUAL` to `Membership.paymentStatus` (mirrors the value already used in `CourseRegistration` from US-11).

**Manual creation flow**
- Catalog-driven: identical selection to the public wizard (`LicenseType` / `LicenseSubtype` / `Category` / supplements), gated by a "federado" toggle. No free-text price ever.
- Membership fee is always applied at the current `MEMBERSHIP_FEE` rate. It is **not** editable per membership.
- DNI uniqueness is enforced (see US-DN3); admin reuses an existing `Member` if the DNI matches, instead of overwriting personal data.
- New memberships from this flow are persisted with `paymentStatus = MANUAL`.

**Editing rules**
- Editing personal data is allowed in any payment status.
- Editing offering / supplements is allowed **only** when `paymentStatus = MANUAL`. Stripe-paid memberships are immutable; pending ones are cancelled and recreated.
- Changing offering / supplements re-snapshots the corresponding price fields. There is never a free-text override.
- The existing `federated-toggle.tsx` in the main memberships table stays untouched — it remains the way to flip `isFederated` on existing rows for non-manual cases.

**Reporting**
- Income split: "cuota socios" = `sum(socioFeeSnapshot)`; "federativas" = `sum(licensePriceSnapshot WHERE isFederated = true)`. Totals only — no cobrado vs. regalado distinction.
- Member count breakdown: total members × cuota actual; of which X federated × suma de federativas.
- Gifted memberships count their full snapshot values toward income totals (the club absorbs the payment, not the consumption).

**Out of scope**
- Audit trail of admin edits.
- Partial discounts (e.g., 50% off) — not representable; would require a new offering or tier.

</details>

<details>
<summary>US-FM1: Schema migration for snapshot decoupling</summary>

> As a developer, I need the data model to track membership fee and federation
> price as independent snapshots so that reporting can distinguish between the
> two and gifted memberships can be modeled without ambiguity.

- [ ] Add `socioFeeSnapshot: Int @default(0)` to `Membership`
- [ ] Add `MANUAL` to the `paymentStatus` values used in code, Zod schemas, and admin UI badges
- [ ] Backfill `socioFeeSnapshot` from current `MEMBERSHIP_FEE` (or destroy data, pre-prod)
- [ ] Update Prisma schema, generate client, create and apply migration
- [ ] Update `/api/checkout` to write `socioFeeSnapshot` on membership creation
- [ ] Tests for snapshot persistence and migration correctness

</details>

<details>
<summary>US-FM2: Manual membership creation flow</summary>

> As an admin, I want to create a membership manually with the same catalog
> selection as the public wizard so that gifted or special-case members are
> recorded with consistent data and prices.

- [ ] New "Crear membresía manual" entry point in `/admin/registros`
- [ ] Form: personal data + toggle "federado" + catalog selection (only visible when toggled on)
- [ ] Cuota socio displayed but not editable
- [ ] On submit: reuses or creates `Member` by DNI; creates `Membership` with `paymentStatus = MANUAL`
- [ ] Snapshots: `socioFeeSnapshot`, `licensePriceSnapshot`, `licenseLabelSnapshot`, supplement prices
- [ ] If DNI matches an existing member, prefill the personal-data fields with their current `Member` row and warn before overwriting
- [ ] Reuses validation and DNI normalization from the public wizard
- [ ] Tests: action, ownership, DNI reuse path, federated and non-federated branches

</details>

<details>
<summary>US-FM3: Edit manual membership</summary>

> As an admin, I want to edit a manual membership's catalog selection so that I
> can correct mistakes without having to delete and recreate the record.

- [ ] Edit dialog reuses the catalog selector from US-FM2 (pre-filled)
- [ ] Personal data editable in any payment status
- [ ] Offering / supplements editable **only** when `paymentStatus = MANUAL`
- [ ] Changing offering / supplements re-snapshots the corresponding price fields
- [ ] No free-text price field ever exposed
- [ ] Tests: edit allowed for MANUAL, blocked for COMPLETED / PENDING / FAILED / REFUNDED

</details>

<details>
<summary>US-FM4: Income summary breakdown</summary>

> As an admin, I want the season metrics to break income into "cuota socios"
> and "federativas" so that I can report accurately to the board and the
> federation.

- [ ] Update `fetchSeasonMetrics()` in `src/lib/admin-queries.ts` to compute and return both sums plus the federated member count
- [ ] Update admin dashboard UI to render the two figures separately (e.g., "Cuota socios: N × X € = Y €" and "Federativas: M federados, total Z €")
- [ ] Tests for the new query branches

</details>

---

## Feature: Season as Year-of-Validity

**Status:** PENDING

The current `Season.name: String` (e.g., "2025-2026") is ambiguous — federation
licenses are valid for one calendar year, and the December 16th transition to
the next season is a registration-window quirk, not a season boundary. This
feature renames seasons to a single `year: Int`, hardcodes the December 16th
transition, hides `isActive` from the admin UI, and surfaces the active season
visibly to users during registration so they always know which year they are
signing up for.

<details>
<summary>Decisions</summary>

- Rename `Season.name: String` to `Season.year: Int @unique`.
- `startDate` = December 16th of `(year - 1)`; `endDate` = December 15th of `year`. December 16th is hardcoded; if it ever needs to vary, it moves to settings later.
- Transition is **seco**: no overlap. After Dec 16 you can no longer register for the previous season ("mala suerte colega").
- `isActive` stays in schema but is hidden from the admin UI table and is no longer admin-editable. `getActiveSeason()` derives the active season from `startDate`/`endDate`.
- `getActiveSeason()` errors loudly if zero or more than one season match `now()` (defensive guard).
- Public wizard banner displays "Temporada {year}" on alta socio, renovación, and course registration. Short text, year-only.

</details>

<details>
<summary>US-SY1: Schema migration to year integer</summary>

> As a developer, I need `Season` to use a single year integer so that ordering,
> comparisons, and grouping are unambiguous and the data model reflects business
> reality.

- [ ] Add `year: Int @unique` to `Season`
- [ ] Migrate existing rows: parse "YYYY-YYYY" name into the upper year (or destroy data, pre-prod)
- [ ] Backfill `startDate` and `endDate` to Dec 16 / Dec 15 boundaries if not already aligned
- [ ] Drop the `name` column once migration completes
- [ ] Update all Prisma queries, types, and rendering in code that reference `Season.name`
- [ ] Tests for the migration and updated queries

</details>

<details>
<summary>US-SY2: Active season resolution by date</summary>

> As a developer, I want `getActiveSeason()` to resolve the current season from
> its start/end dates so that admins never need to flip a flag manually.

- [ ] Update `getActiveSeason()` in `src/lib/settings.ts` to query `WHERE startDate <= now() AND endDate >= now()`
- [ ] Throw a clear error if zero or >1 seasons match
- [ ] Hide `isActive` from the admin seasons table, season form, and any other surface (schema field stays as dead code for now)
- [ ] Tests: returns the expected season at various dates, errors on zero matches, errors on multiple matches

</details>

<details>
<summary>US-SY3: Public banner with active season</summary>

> As a user signing up or renewing, I want to see clearly which season I am
> registering for so that I do not register for the wrong year.

- [ ] Add a banner at the top of `/registro/alta`, `/registro/renovacion`, and the course registration wizard
- [ ] Banner persists across all wizard steps (does not unmount on step change)
- [ ] Text: "Temporada {year}" — short, no dates
- [ ] Tests for visibility on each public flow

</details>

---

## Feature: Course Registration Deadline

**Status:** PENDING

Today courses accept registrations until the course date itself, with no way
to close the door earlier. This feature adds a per-course deadline, surfaces a
"closed" state in the public UI when the deadline passes, and clarifies the
Stripe behavior for sessions that span the boundary.

<details>
<summary>Decisions</summary>

- Add `CourseCatalog.registrationDeadline: DateTime?` (nullable — null means "open until courseDate").
- Public listing always shows `ACTIVE` courses regardless of deadline. A "Cerrado" badge appears when `registrationDeadline < now()`.
- Detail page replaces the registration form with a hardcoded "Inscripciones cerradas" screen when the deadline has passed. Contact text is hardcoded; no admin setting.
- Stripe Checkout sessions created **before** the deadline can complete after the deadline. The webhook does not reject late completions.
- The existing `CoursePrice.saleStart` / `CoursePrice.saleEnd` fields, currently unused in any UI or query, are removed during this migration.

</details>

<details>
<summary>US-CD1: Schema for registration deadline</summary>

> As a developer, I need a per-course deadline field so that the rest of the
> feature can be built on solid foundations.

- [ ] Add `CourseCatalog.registrationDeadline: DateTime?`
- [ ] Remove unused `CoursePrice.saleStart` and `CoursePrice.saleEnd` columns
- [ ] Update Prisma schema, generate client, create and apply migration
- [ ] Update validation schemas in `src/validations/course.ts`
- [ ] Surface the field in the admin course form

</details>

<details>
<summary>US-CD2: "Cerrado" badge in public listing and blocked detail</summary>

> As a visitor, I want to see clearly that a course no longer accepts
> registrations so that I do not waste time filling out the form.

- [ ] Public course listing renders a "Cerrado" badge when `registrationDeadline < now()`
- [ ] Course detail page replaces the registration form with a hardcoded "Inscripciones cerradas. Contacta con administración..." block when closed
- [ ] Tests for badge visibility logic and detail-page blocking

</details>

<details>
<summary>US-CD3: Stripe session post-deadline policy</summary>

> As a user who started checkout before the deadline, I want to be able to
> finish paying even if the deadline has passed by the time I submit, so that
> I am not penalized for slow payment processing.

- [ ] Stripe webhook does not reject `checkout.session.completed` events for sessions whose registration was created before `registrationDeadline`
- [ ] Server-side rejection of new registrations attempted after the deadline (defense in depth, in case the public UI is bypassed)
- [ ] Tests for the boundary conditions

</details>

---

## Feature: DNI Normalization and Uniqueness

**Status:** PENDING

The current `SPANISH_DNI_REGEX` rejects foreigners (NIE, passport). This feature
relaxes DNI validation to accept normalized free text, and reinforces the
backend uniqueness checks for socios so that duplicate `Member` rows cannot
slip in even under client-side bypass or concurrency.

<details>
<summary>Decisions</summary>

- Replace `SPANISH_DNI_REGEX` with a normalization pipeline applied in Zod transforms: `trim` + `toUpperCase` + `replace(/[\s\-_.]/g, "")` + final regex `/^[A-Z0-9]{5,20}$/`.
- Apply the normalization in every entry point that accepts `dni`: `personalDataSchema`, `manualEnrolleeSchema`, and any other Zod schema or server action that touches the field.
- For socios, three layers of uniqueness defense:
  - **Layer 1**: dedicated `check-dni` endpoint (or server action) called on wizard step transition (before navigating to the summary step).
  - **Layer 2**: same check repeated at the checkout endpoint before creating the Stripe session.
  - **Layer 3**: catch Prisma `P2002` unique constraint violations as last resort.
- For courses, no uniqueness check on DNI (it is nullable and non-unique by design — the same person legitimately attends multiple courses).
- Renovation flow treats any past member without a current-season membership as a renewal — no distinction between recent and old members.
- In the alta flow, if DNI exists with no current-season membership, redirect to the renovation flow rather than allowing the alta to overwrite member data.

</details>

<details>
<summary>US-DN1: DNI normalization across schemas</summary>

> As a user with a foreign document (NIE, passport), I want to register without
> being rejected by a Spanish-DNI-only regex, while ensuring my document number
> is stored in a consistent format.

- [ ] Add a `normalizeDni()` helper (trim, uppercase, strip whitespace and `-`, `_`, `.`)
- [ ] Replace `SPANISH_DNI_REGEX` usage with `normalizeDni` + `/^[A-Z0-9]{5,20}$/`
- [ ] Apply in `personalDataSchema`, `manualEnrolleeSchema`, and any other entry point that accepts DNI
- [ ] Tests for normalization edge cases (mixed case, internal spaces, dashes, dots, length boundaries)

</details>

<details>
<summary>US-DN2: Pre-step DNI uniqueness check for socios</summary>

> As a user signing up, I want to know before filling out the rest of the form
> whether my DNI conflicts with an existing membership, so that I can take the
> correct action (renew, contact admin, etc.) without retyping data.

- [ ] New `POST /api/registration/check-dni` endpoint (or server action)
- [ ] Returns `{ ok, reason }` distinguishing: `ok`, `dni_existe_con_membresia_temporada`, `dni_existe_sin_membresia_temporada`, `dni_no_existe`
- [ ] Wizard calls it on step transition; blocks navigation if there is a conflict
- [ ] Alta flow: redirect to renovation when DNI exists without current-season membership
- [ ] Renovation flow: reject when DNI does not exist
- [ ] Tests for each `reason` and each flow direction

</details>

<details>
<summary>US-DN3: Defense-in-depth uniqueness checks</summary>

> As a developer, I need backend validation at the checkout endpoint and at the
> create call so that race conditions and client-side bypasses cannot create
> duplicate members.

- [ ] Repeat DNI check inside `/api/checkout` before creating the Stripe session
- [ ] Catch Prisma `P2002` unique violations on `member.create` and return a clear error
- [ ] Tests for race-condition simulation and the P2002 path

</details>

---

## Feature: RGPD Dialog Gate

**Status:** PENDING

The privacy policy checkbox today can be ticked without ever opening the
linked dialog. This feature gates the checkbox so that users must open the
privacy dialog at least once before being able to consent.

<details>
<summary>Decisions</summary>

- Checkbox is disabled until the user opens the privacy dialog at least once.
- "Has opened" state is persisted in the wizard state, so it survives navigation between steps.
- Applies to alta socio (and renovación) and to course registration.
- No minimum dialog-open time. Opening the dialog once is enough to enable the checkbox.

</details>

<details>
<summary>US-RG1: Privacy dialog gates the consent checkbox</summary>

> As a user, I want the privacy checkbox to require me to actually open the
> privacy text at least once, so that consent reflects an informed decision.

- [ ] Add `hasOpenedPrivacyDialog` state to the relevant wizard contexts
- [ ] Dialog `onOpenChange` flips the state to true on the first open
- [ ] Checkbox `disabled={!hasOpenedPrivacyDialog}`
- [ ] State persists across wizard step navigation
- [ ] Apply to alta socio, renovación, and course registration wizards
- [ ] Tests: cannot tick before opening, can tick after opening, state survives step navigation

</details>

---

## Feature: Course Participant Editing and Price Snapshot

**Status:** PENDING

US-12 already plans editing of course participants. This feature expands the
scope to include the price tier and adds a price snapshot to
`CourseRegistration` so that historical reports remain stable when prices
change. It also adds a season tag to `CourseCatalog` so that courses can be
filtered by season just like memberships.

<details>
<summary>Decisions</summary>

- Add `CourseRegistration.amountSnapshot: Int` (snapshot of `CoursePrice.amountCents` at create time).
- Add `CourseCatalog.seasonId` (FK to `Season`, defaulting to `getActiveSeason()` at create). Enables filtering courses by past or current season.
- Editing personal data is allowed in any `paymentStatus`. Editing `coursePriceId` is allowed only in `paymentStatus = MANUAL` (mirrors the membership rule).
- No free-text price overrides. Special prices (e.g., "Cortesía 0€") must be modeled as new tiers in `CoursePrice`.
- Income reports for courses use `sum(amountSnapshot WHERE paymentStatus IN (COMPLETED, MANUAL))` for stability.
- Supersedes US-12 (Instructor Role feature). The `updateEnrollee` server action work moves into US-CP2.

</details>

<details>
<summary>US-CP1: Schema migration for price snapshot and season tag</summary>

> As a developer, I need `CourseRegistration` to store a price snapshot and
> `CourseCatalog` to carry a season FK so that historical income is stable
> and courses can be grouped by season.

- [ ] Add `CourseRegistration.amountSnapshot: Int @default(0)`
- [ ] Backfill from `CoursePrice.amountCents` (or destroy data, pre-prod)
- [ ] Add `CourseCatalog.seasonId: String` (FK), backfilled from the `Season` whose date range contains `courseDate`
- [ ] New courses default `seasonId` to `getActiveSeason().id` at create time
- [ ] Update Prisma schema, generate client, migrate
- [ ] Tests for migration and default-on-create

</details>

<details>
<summary>US-CP2: Edit course participant (supersedes US-12)</summary>

> As an instructor or admin, I want to edit any data for a course participant,
> including the price tier they are on, so that I can correct mistakes and
> manage edge cases without deleting records.

- [ ] `updateEnrollee` server action with ownership guard (course instructor or admin)
- [ ] Reuses add-participant dialog in edit mode (pre-filled with current data)
- [ ] Personal data fields editable in any payment status
- [ ] `coursePriceId` editable only when `paymentStatus = MANUAL`; on change, re-snapshots `amountSnapshot`
- [ ] Edit button on each participant row (desktop + mobile)
- [ ] Tests: ownership guard, paymentStatus restrictions, snapshot update on price-tier change
- [ ] Mark US-12 in the Instructor Role feature as superseded

</details>

<details>
<summary>US-CP3: Filter courses by season</summary>

> As an admin or instructor, I want to filter the course list by season so that
> I can review past activity and plan the upcoming year.

- [ ] Add a season filter dropdown to the admin course list (mirrors the membership filter pattern in `src/lib/admin-queries.ts`)
- [ ] Filter values: each `Season.year` available in the database, plus an "All" option
- [ ] Default to active season
- [ ] Tests for the filter query

</details>

<details>
<summary>US-CP4: Course income summary uses snapshot</summary>

> As an admin, I want course income totals to be stable when course prices are
> updated for future seasons, so that historical reports remain accurate.

- [ ] Replace any income calculation that joins `CoursePrice.amountCents` with `sum(CourseRegistration.amountSnapshot)`
- [ ] Filter by `paymentStatus IN (COMPLETED, MANUAL)`
- [ ] Tests for income totals across price changes

</details>

---

## Feature: UX Polish

**Status:** PENDING

A small bundle of high-value, low-risk UX improvements that surfaced during
review.

<details>
<summary>US-UX1: Show/hide password toggle</summary>

> As a user, I want to be able to reveal what I typed in a password field so
> that I can verify it before submitting.

- [ ] Add a show/hide button (eye icon, Lucide) to all `type="password"` inputs
- [ ] Apply in admin login, change password form, create user, and any other password input
- [ ] Tests for toggle behavior

</details>

<details>
<summary>US-UX2: Preserve email on failed login</summary>

> As an admin trying to log in, I do not want to retype my email every time
> I get the password wrong.

- [ ] Login server action preserves the email field on failure
- [ ] Only the password field is cleared
- [ ] Tests for the failure path

</details>

<details>
<summary>US-UX3: Sidebar active section indicator</summary>

> As a user navigating the admin panel, I want to see at a glance which section
> I am currently on so that I do not lose context.

- [ ] Sidebar uses `usePathname()` to detect the active route
- [ ] Active item gets a distinct visual style (background tint + accent border, e.g., `bg-primary/10 text-primary border-l-2 border-primary`)
- [ ] Hover behavior unchanged
- [ ] Tests for active item logic

</details>

---

## Feature: Active Member Discount on Courses

**Status:** DEFERRED

Apply a discount on course registration when the registrant is identified as
an active socio of the current season. Out of scope for this round; planned
for the next season cycle.

<details>
<summary>Decisions (preliminary, not final)</summary>

- Identification by DNI: at course registration, look up `Member` by DNI and check whether they have an `ACTIVE` `Membership` for the current season (`getActiveSeason()`).
- Discount mechanism to be defined: percentage off, fixed amount, or a special tier in `CoursePrice` selected automatically.
- Applies only at the time of registration; existing registrations are not retroactively re-priced.
- Re-grill before implementation to lock the discount mechanism.

</details>

<details>
<summary>US-AD1: Discount lookup at course registration</summary>

> As a course enrollee who is also an active club member, I want my discount to
> be applied automatically so that I do not have to enter codes or contact the
> club beforehand.

- [ ] Define discount mechanism (re-grill required)
- [ ] Implement member lookup by DNI at course registration time
- [ ] Apply discount via the agreed mechanism
- [ ] Tests for active-member, expired-member, and non-member paths

</details>
