import { expect, test } from "@playwright/test";
import { ADMIN, login, openNavigation } from "./helpers";

test("switches between light and dark mode and remembers the choice", async ({ page }) => {
  await login(page, ADMIN);

  await openNavigation(page);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await openNavigation(page);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("collapses the sidebar and remembers it after a reload", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "On small screens the sidebar is a drawer");
  await login(page, ADMIN);
  const nav = page.getByRole("navigation", { name: "Main" });

  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  // The labels are hidden but the links keep their accessible names.
  await expect(nav.getByText("Products")).toBeHidden();
  await expect(nav.getByRole("link", { name: "Products" })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(nav.getByText("Products")).toBeVisible();
});
