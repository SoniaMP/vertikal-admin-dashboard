# Roadmap

## Table of Contents

| Feature | Status | Stories |
|---|---|---|
| [Club Notification Emails](#feature-club-notification-emails) | COMPLETED | US-N1 to US-N4 |
| [Instructor Role](#feature-instructor-role) | IN PROGRESS | US-01 to US-10 |
| [Email Branding](#feature-email-branding) | COMPLETED | US-E1 |
| [Course Registration UX](#feature-course-registration-ux) | TODO | US-C1 |

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

**Status:** COMPLETED

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

- [ ] Add delete action on enrollee row (confirmation dialog required)
- [ ] Ownership guard: only the course instructor or an admin can delete
- [ ] Handle Stripe refund consideration (inform user, no automatic refund)
- [ ] Update enrollee count after deletion
- [ ] Tests for delete action and ownership guard

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
- [ ] Test with a real email client (Gmail, Outlook) to confirm image renders

</details>

---

## Feature: Course Registration UX

**Status:** TODO

Improve the course registration flow with a pre-payment review step, consistent
with the membership registration wizard.

<details>
<summary>US-C1: Course registration wizard with summary step</summary>

> As a course enrollee, I want to review my data and the selected price before
> paying so that I can confirm everything is correct.

- [ ] Convert single-step course form into a 2-step wizard (step 1: form, step 2: summary)
- [ ] Summary displays: personal data, selected course, selected price tier, total amount
- [ ] "Anterior" button to go back and edit
- [ ] Privacy policy acceptance checkbox (RGPD) required before "Proceder al pago"
- [ ] "Proceder al pago" button redirects to Stripe checkout (existing flow)

</details>
