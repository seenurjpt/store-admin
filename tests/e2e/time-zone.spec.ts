import { expect, test } from "@playwright/test";
import { ADMIN, login, selectOption } from "./helpers";

// A time zone that differs from the server's, so the test fails if dates were rendered in server time.
const TIME_ZONE = "Pacific/Kiritimati";
test.use({ timezoneId: TIME_ZONE });

const formatInBrowserZone = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: TIME_ZONE }).format(date);

test("shows dates in the browser's time zone", async ({ page }, testInfo) => {
  const name = `E2E Time Zone ${testInfo.project.name}`;
  await login(page, ADMIN);

  await page.goto("/products/new");
  await page.getByRole("textbox", { name: "Name", exact: true }).fill(name);
  await page.getByRole("textbox", { name: "Description", exact: true }).fill("Checks date formatting");
  await page.getByRole("spinbutton", { name: "Price", exact: true }).fill("1");
  await page.getByRole("spinbutton", { name: "Stock", exact: true }).fill("1");
  await selectOption(page, "Category", "Other");

  const before = formatInBrowserZone(new Date());
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  const after = formatInBrowserZone(new Date());

  // "Created" on the product page, rendered on the server.
  const created = await page.locator("dt", { hasText: /^Created$/ }).locator("xpath=following-sibling::dd").textContent();
  expect([before, after]).toContain(created);

  // Clean up so other tests see the original data.
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog", { name: "Delete product?" }).getByRole("button", { name: "Delete" }).click();
  await expect(page).toHaveURL(/\/products$/);
});
