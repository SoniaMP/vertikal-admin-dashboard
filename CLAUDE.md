# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run all tests (vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npx vitest run src/path/to/file.test.ts` | Run a single test file |
| `npx prisma migrate dev` | Apply pending migrations |
| `npx prisma generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed database |
| `npm run db:reset` | Reset DB and re-run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run admin:create` | Create an admin user |

**Environment:** Uses `.env` (not `.env.local`) — Prisma reads `.env` via `dotenv/config`.

## Architecture

**Stack:** Next.js 16 App Router, TypeScript, Prisma + SQLite (better-sqlite3), Stripe, Resend, NextAuth v5, Tailwind CSS 4, Radix UI, React Hook Form + Zod.

### Route Structure

- `/registro` — Public membership registration wizard (alta = new, renovacion = renewal)
- `/cursos` — Public course registration
- `/admin/login` — Admin login (credentials-based via NextAuth)
- `/admin/(dashboard)/*` — Protected admin panel (middleware redirects unauthenticated users)
  - `registros` — Membership management
  - `cursos` — Course management
  - `tipos-federacion` — License types/subtypes/offerings config
  - `ajustes` — App settings (branding, fees)
  - `export` — Data export

### Key Directories

- `src/lib/` — Core logic: Prisma client (`prisma.ts`), auth (`auth.ts`, `auth.config.ts`), Stripe (`stripe.ts`), email (`resend.ts`, `email-renderer.ts`, `email-branding.ts`), settings, queries
- `src/validations/` — Zod schemas for registration, licenses, courses
- `src/emails/` — React Email templates (membership-confirmation, course-confirmation, welcome)
- `src/components/ui/` — shadcn/ui primitives
- `src/components/admin/` — Admin-specific components
- `src/components/registration/` — Registration wizard components
- `src/helpers/` — Pure utility functions
- `src/hooks/` — Custom React hooks
- `src/types/` — Shared TypeScript types

### Data Model (key concepts)

- **Season-based pricing:** `LicenseOffering` links a season + type + subtype + category to a price. All prices are in cents.
- **Supplements:** Optional add-ons with per-season pricing via `SupplementPrice` and group pricing via `SupplementGroupPrice`.
- **Member vs Membership:** `Member` is the person (unique by DNI). `Membership` is a per-season instance with status (PENDING_PAYMENT, ACTIVE, EXPIRED, CANCELLED) and payment tracking.
- **Snapshots:** `Membership` stores `licensePriceSnapshot` and `licenseLabelSnapshot` to capture price/label at creation time.
- **Active season:** `getActiveSeason()` in `src/lib/settings.ts` is the canonical way to resolve the current season.
- **Courses:** `CourseCatalog` → `CoursePrice` → `CourseRegistration` with Stripe checkout flow.

### Payment Flow

Stripe Checkout sessions are created via `src/lib/stripe.ts` (`getStripe()`). Webhooks at `/api/webhooks/stripe` handle payment confirmation. Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local testing.

### Auth

NextAuth v5 with credentials provider. Middleware (`src/middleware.ts`) protects all `/admin/*` routes. Role-based access via `User → UserRole → Role` join table.

### Path Alias

`@/` maps to `src/` (configured in tsconfig and vitest.config.ts).

## Project Rules (must-follow)

### Language & Style
- Write code and comments in English (USA).
- Prefer clarity over cleverness. No "magic" abstractions without a reason.

### File Size / Complexity Limits
- Max file length: 200 LOC (excluding generated code). If it grows, split into smaller modules.
- Max React component: 150 LOC and 1 responsibility.
- No function > 40 LOC. Extract helpers.

### Naming Conventions
- Variables/functions: camelCase, meaningful, no abbreviations unless common (id, url, ui).
- React components: PascalCase. Hooks: useXxx.
- Booleans: is/has/should/can prefix (isLoading, hasError).
- Constants: UPPER_SNAKE_CASE only for true constants.

### React / TypeScript Rules
- Always TypeScript. Avoid `any`; use `unknown` + narrowing if needed.
- Prefer composition over inheritance.
- Prefer pure components; side effects only in hooks.
- Keep props small; pass objects if they are cohesive.

### Imports & Structure
- One export per file (except types).
- Absolute imports with `@/` prefix.
- No circular dependencies.

### Testing & Quality Gates
- All new logic must have tests (unit or component).
- Run `npm test` and `npm run lint` before proposing final changes.
- Do not disable lint rules without explaining why.

### Git & PR Hygiene
- Small commits, meaningful messages.
- When changing behavior: explain "what/why", not just "how".

### When Uncertain
- Ask before inventing a new pattern. Prefer existing conventions from the codebase.
