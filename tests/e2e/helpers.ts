import { expect, type Page } from "@playwright/test";

// Accounts created by prisma/seed.ts
export const ADMIN = { email: "admin@example.com", password: "Admin123!" };
export const MANAGER = { email: "manager@example.com", password: "Manager123!" };

export async function login(page: Page, account: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

/** Picks an option from an MUI select by its label. */
export async function selectOption(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

/** On small screens the sidebar is a drawer behind a menu button. */
export async function openNavigation(page: Page) {
  const menuButton = page.getByRole("button", { name: "Open navigation" });
  if (await menuButton.isVisible()) await menuButton.click();
}
