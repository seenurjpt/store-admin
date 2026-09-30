# Store Admin

A small admin panel for an online store. You can log in, see a dashboard with store numbers, and manage products: search, filter, sort, page through the list, create, edit, turn products on or off, and delete them.

**Built with:** Next.js 16 (App Router), TypeScript, PostgreSQL, Prisma 7, MUI, Zod, Vitest and Playwright.

---

## Requirements

- Node.js 22 (20.19 or newer also works) and npm 10
- PostgreSQL 15 or newer. The easiest way to get one is with Docker (see below).

## Installation

```bash
npm install
```

This also generates the Prisma database client.

## Environment

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable            | What it's for                                                                  |
| ------------------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`      | Connection string for the app's database                                       |
| `TEST_DATABASE_URL` | A separate database used by the tests. **It is wiped on every test run.**       |
| `SESSION_SECRET`    | Secret used to sign the login cookie. At least 32 characters.                  |

To create a secret you can run `openssl rand -base64 32`. Any random string of 32 or more characters also works.

The default values in `.env.example` already match the Docker database below.

## Database

Start PostgreSQL in Docker:

```bash
docker compose up -d db
```

Then create the tables:

```bash
npm run db:deploy
```

If you change `prisma/schema.prisma`, run `npm run db:migrate` to create a new migration.

## Seed

Load the sample data (2 users, 4 categories and 30 products):

```bash
npm run db:seed
```

The seed can be run more than once without creating duplicates. To start over with a clean database:

```bash
npm run db:reset
```

## Development

```bash
npm run dev
```

Then open http://localhost:3000.

## Testing

The integration and E2E tests need the database to be running (`docker compose up -d db`). They use `TEST_DATABASE_URL`, and create that database for you.

```bash
npm test                  # unit + integration tests
npm run test:unit         # unit tests only (no database needed)
npm run test:integration  # server actions against a real test database
npm run test:e2e          # full browser tests on desktop and mobile
```

Before running the E2E tests for the first time, install the browser:

```bash
npx playwright install chromium
```

Other checks:

```bash
npm run lint
npm run typecheck
```

## Build

```bash
npm run build
npm run start
```

## Test Account

Both accounts are created by the seed.

| Role    | Email                 | Password      |
| ------- | --------------------- | ------------- |
| Admin   | `admin@example.com`   | `Admin123!`   |
| Manager | `manager@example.com` | `Manager123!` |

Admins can do everything. Managers can view, create, edit and change the status of products, but **cannot delete** them.

---

## Running everything with Docker (optional)

If you just want to try the app, Docker can run the database, the migrations, the seed and the app together. You only need Docker, not Node.js.

```bash
cp .env.example .env        # then set SESSION_SECRET
docker compose --profile app up --build
```

Open http://localhost:3000. To stop it, run `docker compose --profile app down`. Add `-v` to also delete the database.

If port 3000 or 5432 is already taken:

```bash
APP_PORT=3001 POSTGRES_PORT=5433 docker compose --profile app up --build
```

---

## Project structure

```
prisma/
  schema.prisma        Database tables: User, Category, Product
  migrations/          SQL migrations
  seed.ts              Sample users, categories and products
src/
  proxy.ts             Sends logged-out users to /login
  app/
    login/             Login page
    (app)/             Pages that need a login: dashboard, products, product details, create and edit
      @modal/          Create and edit forms shown in a dialog
    actions/           Server Actions (login, logout, product changes)
  components/          Layout, sidebar and product UI
  lib/                 Auth, permissions, validation, database queries and helpers
tests/
  unit/                Validation, permissions, URL parsing, stock levels, time zones
  integration/         Server Actions tested against a real database
  e2e/                 Browser tests with Playwright
```

---

## Technical Decisions

**Server Components for reading, Server Actions for changes.**
Pages load their data directly on the server, so there is no separate REST API. Creating, editing, deleting, changing status, logging in and logging out are all Server Actions. After a change, the page refreshes its data automatically and a toast message confirms what happened. Client Components are only used where the page needs interaction, like forms, filters, dialogs and the sidebar.

**The product list lives in the URL.**
Search, status, category, sorting, page and page size are stored in the address, for example `/products?search=pizza&status=active&page=2`. This means a view can be shared, bookmarked or refreshed, and the back button works. Wrong values in the URL fall back to the defaults instead of breaking the page. Search waits 300 ms after you stop typing before it runs.

**Create and edit open in a dialog.**
Clicking "New product" or "Edit" opens the form on top of the current page, but the URL still changes. If you open that link directly or refresh, you get the full-page form instead. Both use the same form component, so the rules stay the same.

**Simple custom login.**
The app only needs email and password, so I used a small setup based on the Next.js authentication guide instead of a full auth library:
- Passwords are hashed with bcrypt.
- After login, a signed cookie holds only the user's id. The cookie is `httpOnly`, so page scripts can't read it.
- `proxy.ts` quickly redirects logged-out users to the login page.
- The real check happens on the server for every page and every action. It loads the user and their role from the database each time, so a role change takes effect right away.

**Permissions are checked on the server, not only in the UI.**
All permissions are defined in one place (`src/lib/permissions.ts`). The UI uses them to hide the delete button from managers, and the Server Actions use the same check to reject the request. So a manager who calls the delete action directly still gets a "no permission" error, and there is a test for this. Products are shared store data, so changing an id in the URL only reaches products your role can already see.

**One set of validation rules.**
The product rules are written once with Zod. The form checks them in the browser so you see mistakes immediately, and the server checks them again because browser data can't be trusted. Image URLs must start with `http` or `https`.

**Database.**
PostgreSQL with Prisma. Prices are stored as exact decimals to avoid rounding errors. Categories are their own table. A category that still has products can't be deleted. Pagination always sorts by the chosen column plus the id, so items don't jump between pages.

**UI.**
MUI components with one shared theme, light and dark mode, and a sidebar that can be collapsed. On phones the sidebar becomes a menu and the products table becomes a list. For accessibility the app uses labelled form fields, keyboard-friendly controls, visible focus styles, alt text on images and labels on icon buttons. Status colours meet WCAG AA contrast.

**Dates in the viewer's time zone.**
The browser saves its time zone in a cookie, and the server uses it to format dates. That way dates are correct on the first load, even though the server runs in UTC.

**Error handling.**
Wrong logins and form errors are shown next to the fields. A missing product shows a "not found" page. Expected failures like "no permission" or database errors show a friendly message. Unexpected errors, such as the database being down, show an error page with a "Try again" button.

**Testing.**
- **Unit tests:** validation rules, permissions, reading filters from the URL, stock levels and date formatting.
- **Integration tests:** the real Server Actions run against a real PostgreSQL test database. Only the logged-in user and page refresh calls are mocked.
- **E2E tests:** Playwright on desktop and mobile. They cover login and logout, creating a product then checking and deleting it, search with filters and pagination, validation errors, manager restrictions, dark mode and time zones.

---

## Not included / possible improvements

- Limiting login attempts
- Image upload (only image URLs are supported)
- A page to manage users (users come from the seed)
- A CI pipeline (all the commands above can run in CI)

## Time

Approximately 6 hours with optional work as well.
