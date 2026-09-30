import { execSync } from "node:child_process";
import { prepareTestDatabase } from "../test-database";

// Start every E2E run from the same seeded data.
export default function globalSetup() {
  const env = { ...process.env, DATABASE_URL: prepareTestDatabase() };

  execSync("npx prisma db execute --stdin", {
    input: 'TRUNCATE TABLE "Product", "Category", "User" CASCADE;',
    env,
  });
  execSync("npx prisma db seed", { env, stdio: "pipe" });
}
