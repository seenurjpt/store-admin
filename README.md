# Store Admin

A small management panel for an online store. Staff can log in, see a dashboard, and manage products: search, filter, sort, paginate, create, edit, change status and delete.

**Stack:** Next.js 16 (App Router) · TypeScript · PostgreSQL · Prisma 7 · MUI · Zod · Sonner (toasts) · Vitest · Playwright · Docker

## Test accounts

Both are created by the seed script.

| Role    | Email                 | Password      |
| ------- | --------------------- | ------------- |
| Admin   | `admin@example.com`   | `Admin123!`   |
| Manager | `manager@example.com` | `Manager123!` |

Admins can do everything. Managers can view, create, edit and change the status of products, but **cannot delete** them.

---

## Option A: Run everything with Docker (quickest)

Use this to try the app, or to set it up on someone else's machine. You only need **Docker Desktop** (or Docker Engine with Compose v2) and Git. Node.js is not required.

```bash
# 1. Get the code
git clone <repository-url> store-admin
cd store-admin

# 2. Create the env file and set a session secret
cp .env.example .env
openssl rand -base64 32   # paste the output into SESSION_SECRET in .env

# 3. Build and start Postgres, run migrations + seed, and start the app
docker compose --profile app up --build
```

Open http://localhost:3000 and log in with one of the test accounts above.

What happens on `up`:

1. `db` starts PostgreSQL 17 and waits until it's healthy.
2. `migrate` (a one-off container) runs `prisma migrate deploy` and `prisma db seed`, then exits. The seed is idempotent, so restarting doesn't duplicate data.
3. `app` starts the production Next.js server once migrations have finished.

Useful commands:

```bash
docker compose --profile app up -d --build    # run in the background
docker compose --profile app logs -f app      # follow app logs
docker compose --profile app down             # stop (data is kept)
docker compose --profile app down -v          # stop and delete the database volume
```

If port 3000 or 5432 is already in use, pick other host ports:

```bash
APP_PORT=3001 POSTGRES_PORT=5433 docker compose --profile app up --build
```

> Windows: run the commands in PowerShell or Git Bash. If `openssl` isn't available, any random string of 32+ characters works as `SESSION_SECRET`.

## Option B: Local development

### Requirements

- Node.js **22** (20.19+ also works) and npm 10
- PostgreSQL 15+ (the easiest way is the Docker `db` service below)

### Installation

```bash
npm install          # also runs `prisma generate`
```

### Environment

```bash
cp .env.example .env
```

| Variable            | Purpose                                                                           |
| ------------------- | --------------------------------------------------------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string for the app                                          |
| `TEST_DATABASE_URL` | Separate database for integration and E2E tests (**wiped on every test run**)     |
| `SESSION_SECRET`    | Secret for signing session cookies, at least 32 characters (`openssl rand -base64 32`) |

The defaults in `.env.example` match the Docker database.

### Database

Start only PostgreSQL in Docker:

```bash
docker compose up -d db
```

Apply the migrations (this creates the tables from scratch):

```bash
npm run db:deploy        # apply existing migrations
# or, while changing prisma/schema.prisma:
npm run db:migrate       # create and apply a new migration
```

### Seed

```bash
npm run db:seed          # 2 users, 4 categories, 30 products (photos are loaded from Unsplash)
npm run db:reset         # drop everything, re-run migrations and seed
```

### Development

```bash
npm run dev
```

Open http://localhost:3000.

### Testing

The integration and E2E tests need the database running (`docker compose up -d db`). They use `TEST_DATABASE_URL` and create that database automatically.

```bash
npm test                  # unit + integration (Vitest)
npm run test:unit         # unit only, no database needed
npm run test:integration  # Server Actions and queries against the test database
npm run test:e2e          # Playwright: builds the app, starts it on :3200, runs desktop + mobile
```

Before the first E2E run, install the browser once: `npx playwright install chromium`.

Other checks:

```bash
npm run lint
npm run typecheck
```

### Build

```bash
npm run build
npm run start
```

---

## Project structure

```
prisma/
  schema.prisma            User, Category, Product models
  migrations/              SQL migrations
  seed.ts                  Test users, categories and products
src/
  proxy.ts                 Redirects signed-out users to /login (optimistic check)
  app/
    login/                 Login page + form
    (app)/                 Everything behind authentication (shared sidebar layout)
      @modal/              Create/edit product dialogs (intercepted routes)
      dashboard/
      products/            List, [id] details, [id]/edit, new
    actions/               Server Actions (auth, products)
  components/              App shell (sidebar), page header and product UI (MUI based)
  lib/
    auth.ts                Current user, credential check
    session.ts             Signed JWT cookie (jose)
    permissions.ts         Role → permission map
    validation.ts          Zod schemas shared by the form and the Server Actions
    product-query.ts       URL search params ↔ list query
    products.ts            Database reads (list, details, dashboard)
    stock.ts               Low / out-of-stock levels
    format.ts              Price, number and date formatting
    time-zone.ts           Viewer time zone cookie (+ request-time-zone.ts on the server)
  theme.ts                 MUI theme: palette for light and dark mode, component defaults
tests/
  unit/                    Validation, permissions, query parsing, stock levels, time zones
  integration/             Server Actions + queries against a real test database
  e2e/                     Playwright user flows
```

## Technical decisions

**Server Components for reads, Server Actions for writes.** Pages are async Server Components that query the database directly through `src/lib/products.ts`, so there's no separate REST API or client-side fetching library. Mutations (create, update, delete, change status, login, logout) are Server Actions. After a mutation they call `revalidatePath`, so the current page re-renders with fresh data without a manual reload. The actions return a typed result instead of redirecting; the client then shows a toast (Sonner, top right) and, after creating or editing, navigates to the product. The toaster sits in the root layout, so a toast stays visible across that navigation. Client Components are only used where interactivity is needed: the sidebar drawer, forms, filters, the delete dialog, the status toggle, pagination and the table row actions. The row actions are a Client Component partly for a technical reason: MUI's `Tooltip` clones its child element, and an element passed in from a Server Component can reach the client as a lazy reference, which caused a hydration mismatch.

**URL as the state for the product list.** Search, status, category, sort, order, page and page size (10, 20 or 50) live in the query string (`/products?search=pizza&status=active&page=2`). Any view can be shared, bookmarked or restored after a refresh, and the back button works. The params are parsed with Zod, and invalid values fall back to defaults instead of erroring. The results are wrapped in a `Suspense` boundary keyed by the query, so a loading skeleton shows while the next result loads. Search is debounced by 300 ms.

**Create and edit in a modal.** Clicking "New product" or "Edit" opens the form in a dialog over the current page, using an `@modal` parallel route slot with intercepted `(.)products/new` and `(.)products/[id]/edit` routes. The URL still changes, so opening that link directly or refreshing shows the full-page form instead, and the back button closes the dialog. After editing, the dialog closes and the page underneath shows the new values; after creating, the new product's page opens. Both variants use the same `ProductForm`, so validation and Server Actions are shared. On phones the dialog is full screen, and clicking the backdrop doesn't close it, so typed input isn't lost by accident.

**Authentication.** I used a small custom setup, following the approach in the Next.js authentication guide, rather than an auth library, because the app only needs email/password login:
- Passwords are hashed with bcrypt.
- On login, a signed JWT (HS256, `jose`) containing only the user id is stored in an `httpOnly`, `SameSite=Lax` cookie. The cookie is also `Secure` in production.
- `proxy.ts` does a fast, optimistic check of the cookie signature and redirects signed-out users to `/login`.
- The real checks happen on the server in every page and Server Action through `requireUser()`. It loads the user and their role from the database on each request (deduplicated with React `cache`), so a deleted user or a role change takes effect immediately.
- Unknown emails still run a bcrypt comparison, so response time doesn't reveal which emails exist.

**Authorization.** Permissions live in one map (`src/lib/permissions.ts`), and the same `can(role, permission)` function is used in two places:
- In the UI, to hide the delete buttons from managers.
- In the Server Actions, to reject the request. Hiding a button is not security; a manager calling `deleteProduct` directly gets a "permission" error, and there's an integration test for this.

Products are shared store data, not owned by individual users. Access is therefore controlled by authentication plus role on every operation, and changing an id in a URL or request only reaches products the role is already allowed to see.

**Validation.** One Zod schema (`productSchema`) defines the product rules, and it runs in two places. The form checks it in the browser first, so mistakes show instantly without a request. The Server Actions validate the submitted `FormData` again with the same schema, because anything sent from the browser can be tampered with, and return per-field errors. The action also checks that the category exists, and image URLs must be `http(s)`, so values like `javascript:` can't end up in an `<img>`. The form keeps the user's input after a failed submit.

**Database.** PostgreSQL with Prisma 7, using the `pg` driver adapter.
- Price is `Decimal(10,2)` to avoid floating-point rounding, and is converted to a number before leaving the data layer.
- Categories are a separate table with a unique `slug` used in URLs.
- There are indexes on `status`, `categoryId` and `createdAt`.
- Deleting a category that still has products is blocked (`onDelete: Restrict`).
- `createdBy` is kept for auditing and set to `NULL` if the user is removed.
- Pagination sorts by the chosen column plus `id`, so pages stay stable when values are equal.

**UI.** MUI provides the components: form fields, selects, table, dialog, skeletons and pagination. All colours, typography and component defaults live in one theme (`src/theme.ts`): slate neutrals with an indigo accent, and status colours chosen to meet WCAG AA contrast. MUI links are wired to `next/link` through the theme, so navigation stays client-side. Navigation is a sidebar that follows the colour scheme and can be collapsed to icons; the choice is saved in a cookie so the server renders the right width on the next visit. On small screens it becomes a drawer behind a menu button. Light and dark mode use MUI colour schemes: colours are CSS variables, the active scheme is a class on `<html>`, and `InitColorSchemeScript` applies the saved choice before the first paint, so there is no flash of the wrong theme and no hydration mismatch. On mobile the products table becomes a list. Products without an image show a coloured placeholder with their category's icon. Accessibility relies on MUI's labelled inputs, keyboard support and focus styles, plus semantic landmarks, `aria-label`s on icon buttons, and confirmation dialogs with proper titles. Product images are user-provided URLs from any host, so they're rendered with MUI `Avatar` (a plain `img` with a placeholder fallback) rather than `next/image`, which would require allow-listing every host.

**Time zones.** Dates are rendered on the server, but should appear in the viewer's local time (the Docker container runs in UTC). A small client component stores the browser's time zone in a `tz` cookie, and Server Components format dates with it, so the HTML is correct from the first render, with no flash or hydration mismatch. The cookie is validated with `Intl` before use, and the server's own time zone is the fallback.

**Error handling.**
- Invalid logins and form errors are shown inline next to the fields.
- Missing products render `not-found.tsx`.
- Expected action failures (not found, forbidden, database errors) come back as friendly messages and are logged on the server.
- Unexpected failures, such as the database being down, are caught by `error.tsx` boundaries with a "Try again" button.

**Testing.**
- **Unit tests** cover the validation rules, permissions, URL query parsing, stock levels and date formatting across time zones.
- **Integration tests** call the real Server Actions against a real PostgreSQL test database. Only the logged-in user, `revalidatePath` and `redirect` are mocked, so validation, permission checks and SQL all run for real.
- **E2E tests** (Playwright, desktop and mobile viewports) cover login and logout, the full create → verify → delete flow with its toasts, combined search, filters, pagination and page size in the URL, validation errors, manager restrictions, dark mode and sidebar preferences, and dates shown in the browser's time zone.

## Not included / possible improvements

- Login rate limiting / account lockout
- Image upload (the app accepts image URLs only)
- User management UI (users come from the seed)
- CI pipeline (all commands above are CI-ready)

## Time spent

Approximately _N_ hours.
