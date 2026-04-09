# Roadmap

## Table of Contents

| Feature | Status | Stories |
|---|---|---|
| [Club Notification Emails](#feature-club-notification-emails) | COMPLETED | US-N1 to US-N4 |
| [Instructor Role](#feature-instructor-role) | IN PROGRESS | US-01 to US-09 |

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

**Status:** IN PROGRESS (US-01, US-02 completed)

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

- [ ] Update middleware to check role and allow access accordingly
- [ ] Admin nav: full menu (as today) + new "Usuarios" section
- [ ] Instructor nav: "Mis Cursos" + "Mi Cuenta"
- [ ] Redirect instructor away from admin-only routes (registros, ajustes, etc.)
- [ ] Show current user name and role in sidebar/header

</details>

<details>
<summary>US-04: Instructor can create and edit courses</summary>

> As an instructor, I want to create and fully manage my courses
> so that I can set up offerings for the club's students.

- [ ] "Mis Cursos" page listing only courses where `instructorId = currentUser`
- [ ] Create course form (all fields: name, description, dates, location, capacity, prices)
- [ ] New course defaults to DRAFT status
- [ ] Edit course form (same fields, available in any status)
- [ ] Deactivate course (set status to INACTIVE)
- [ ] Visual indicator of course status (DRAFT, ACTIVE, INACTIVE)

</details>

<details>
<summary>US-05: Admin approves courses</summary>

> As an admin, I want to review and approve instructor-created courses
> so that only vetted courses appear on the public site.

- [ ] Admin course list shows all courses with status and instructor name
- [ ] Filter/badge for DRAFT courses pending approval
- [ ] "Approve" action: DRAFT -> ACTIVE
- [ ] "Deactivate" action: ACTIVE -> INACTIVE
- [ ] "Reactivate" action: INACTIVE -> ACTIVE
- [ ] Admin can also edit any course regardless of instructor

</details>

<details>
<summary>US-06: Instructor views and exports enrollees</summary>

> As an instructor, I want to see who enrolled in my courses and export that data
> so that I can handle federation paperwork and issue certificates.

- [ ] Enrollee list per course (name, email, phone, DNI, address, DOB, payment status)
- [ ] Only visible for courses where `instructorId = currentUser`
- [ ] Export enrollees to CSV/Excel
- [ ] Admin can also see enrollees for any course (existing behavior)

</details>

<details>
<summary>US-07: Instructor receives enrollment notifications</summary>

> As an instructor, I want to receive an email when someone enrolls in my course
> so that I stay informed without checking the panel constantly.

- [ ] When a course has an instructor, send notification to `instructor.email`
- [ ] Fall back to global `COURSE_NOTIFICATION_EMAILS` for courses without instructor
- [ ] Email template: course name, enrollee name, enrollment date
- [ ] Admin notification behavior unchanged (global list still works for memberships)

</details>

<details>
<summary>US-08: Instructor account page (Mi Cuenta)</summary>

> As an instructor, I want to change my password
> so that I can secure my account after receiving a temporary password.

- [ ] "Mi Cuenta" page accessible to both ADMIN and INSTRUCTOR roles
- [ ] Change password form (current password + new password + confirm)
- [ ] Display account info (name, email, role) — read-only

</details>

<details>
<summary>US-09: Public site respects course status</summary>

> As a visitor, I should only see ACTIVE courses on the public site
> so that I cannot register for courses that are not approved.

- [ ] Update `/cursos` page query: filter by `status = ACTIVE` instead of `active = true`
- [ ] Stripe checkout creation rejects non-ACTIVE courses
- [ ] Course detail page returns 404 for non-ACTIVE courses

</details>
