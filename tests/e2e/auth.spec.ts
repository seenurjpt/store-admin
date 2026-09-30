import { expect, test } from "@playwright/test";
import { ADMIN, login, openNavigation } from "./helpers";

test("redirects to the login page when not logged in", async ({ page }) => {
  await page.goto("/products");
  await expect(page).toHaveURL(/\/login$/);
});

test("shows an error for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("Invalid email or password.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("logs in to the dashboard and logs out again", async ({ page }) => {
  await login(page, ADMIN);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Total products")).toBeVisible();

  await openNavigation(page);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
