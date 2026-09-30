import { execSync } from "node:child_process";

/**
 * Returns the test database URL and applies migrations to it.
 * Refuses to run against the main database because tests wipe their data.
 */
export function prepareTestDatabase(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error("TEST_DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  if (url === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL must point to a different database than DATABASE_URL.");
  }

  // `migrate deploy` also creates the database if it doesn't exist yet.
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: url } });
  return url;
}
