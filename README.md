# Club Vertikal

Web application for managing memberships, courses, and registrations for Club Vertikal. Built with Next.js, Prisma (SQLite), Stripe, and Resend.

## Prerequisites

- Node.js >= 20
- npm

## Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd vertikal-club
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

> **Important:** Copy to `.env`, not `.env.local`. Prisma reads `.env` via `dotenv/config` and does not support `.env.local`.

See [`.env.example`](.env.example) for all available variables. Required variables:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Display name for the club |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `EMAIL_FROM` | Sender address for emails |
| `AUTH_SECRET` | Secret used by Auth.js to sign JWTs |
| `AUTH_URL` | Canonical URL of the app (used by Auth.js for CSRF protection) |
| `DATABASE_URL` | SQLite database path |

For local development, the defaults for `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`, `AUTH_URL`, and `DATABASE_URL` work out of the box. You need to set the Stripe and Resend keys to test payments or emails, and `AUTH_SECRET` to use the admin panel.

4. Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

5. (Optional) Seed the database with sample data:

```bash
npm run db:seed
```

6. (Optional) Create an admin user:

```bash
npm run admin:create
```

## Development

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Useful Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:seed` | Seed the database with sample data |
| `npm run db:reset` | Reset the database and re-run migrations |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run admin:create` | Create an admin user |

## Email Preview

Email templates are built with `@react-email/components`. To preview them with real branding from the database, log in as admin and visit:

[`/api/email-preview`](http://localhost:3000/api/email-preview) — index page with links to all available templates.

These routes are protected (requires admin session). Branding changes saved in **Admin > Ajustes** are reflected immediately. To add a new template to the preview, register it in `src/app/api/email-preview/templates.ts`.

## Stripe Webhooks (Local)

To test Stripe webhooks locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret it prints and set it as `STRIPE_WEBHOOK_SECRET` in your `.env`.
