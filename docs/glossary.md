# Glossary

Domain terms used across the codebase.

## People

| Term | Definition |
|---|---|
| **Member** | A person registered in the club, identified by DNI. Stores contact and demographic data. |
| **User** | A staff account that logs into the admin panel. Can have one or more roles. |
| **Admin** | A User with the ADMIN role. Full access to all features and data. |
| **Instructor** | A User with the INSTRUCTOR role. Manages their own courses and enrollees. |

## Memberships & Licensing

| Term | Definition |
|---|---|
| **Season** | A time-bounded period (e.g., "2025-2026") that scopes pricing, memberships, and offerings. |
| **Membership** | A per-season enrollment linking a Member to a Season with a license, status, and payment info. |
| **LicenseType** | Top-level license category (e.g., "Federada", "No Federada"). |
| **LicenseSubtype** | A specific variation within a LicenseType. |
| **Category** | Secondary classification for licenses (e.g., age group or activity type). |
| **LicenseOffering** | A concrete price point for a specific Season + LicenseType + LicenseSubtype + Category combination. |

## Supplements

| Term | Definition |
|---|---|
| **Supplement** | An optional paid add-on that can be attached to a Membership. |
| **SupplementGroup** | A logical grouping of Supplements with optional bundled pricing. |
| **SupplementPrice** | Per-season pricing for an individual Supplement. |
| **SupplementGroupPrice** | Flat bundled price for any combination of Supplements within a group. |
| **MembershipSupplement** | Join record tracking which Supplements a Membership includes, with price snapshot. |

## Courses

| Term | Definition |
|---|---|
| **CourseType** | A category of courses (e.g., "Iniciacion", "Perfeccionamiento"). |
| **CourseCatalog** | A specific course offering with dates, capacity, status, and an optional instructor. |
| **CoursePrice** | A pricing tier for a course, with an optional sales window. |
| **CourseRegistration** | An individual enrollment in a course, with payment and confirmation tracking. |

## Course Status

| Status | Description |
|---|---|
| **DRAFT** | Created by an instructor, not yet visible on the public site. Awaiting admin approval. |
| **ACTIVE** | Approved by admin. Visible on `/cursos`, accepting registrations and payments. |
| **INACTIVE** | Deactivated by admin or instructor. Hidden from public site. |

## Auth & Config

| Term | Definition |
|---|---|
| **Role** | A permission level assigned to a User (ADMIN, INSTRUCTOR). |
| **UserRole** | Join table mapping Users to Roles. |
| **AppSetting** | Key-value store for runtime configuration (fees, notification emails, active season, branding). |

## Payment

| Term | Definition |
|---|---|
| **Stripe Checkout** | External payment flow. Sessions are created via `getStripe()` in `src/lib/stripe.ts`. |
| **Webhook** | Stripe calls `/api/webhooks/stripe` to confirm payment. Updates Membership or CourseRegistration status. |
| **Snapshot** | Price and label captured at creation time on Membership/MembershipSupplement. Immutable record of what was charged. |
