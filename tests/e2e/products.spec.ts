import { expect, test } from "@playwright/test";
import { ADMIN, MANAGER, login, openNavigation, selectOption } from "./helpers";

test("admin creates, verifies and deletes a product", async ({ page }, testInfo) => {
  const name = `E2E Test Burrito ${testInfo.project.name}`;

  await login(page, ADMIN);
  await openNavigation(page);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Products" }).click();
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

  // Create (the form opens in a dialog over the list)
  await page.getByRole("link", { name: "New product" }).click();
  const form = page.getByRole("dialog", { name: /^New product/ });
  await expect(page).toHaveURL(/\/products\/new$/);
  await form.getByRole("textbox", { name: "Name", exact: true }).fill(name);
  await form.getByRole("textbox", { name: "Description", exact: true }).fill("Beans, rice and cheese");
  await form.getByRole("spinbutton", { name: "Price", exact: true }).fill("9.75");
  await form.getByRole("spinbutton", { name: "Stock", exact: true }).fill("7");
  await selectOption(page, "Category", "Food");
  await form.getByRole("button", { name: "Create product" }).click();

  // Verify the toast and the details page
  await expect(form).toBeHidden();
  await expect(page.getByText("Product created")).toBeVisible();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText("Beans, rice and cheese")).toBeVisible();
  await expect(page.getByText("$9.75")).toBeVisible();
  await expect(page.getByText("Active", { exact: true })).toBeVisible();

  // Verify it shows up in the list
  await page.getByRole("link", { name: "Back to products" }).click();
  await page.getByLabel("Search by name").fill(name);
  await expect(page).toHaveURL(/search=E2E/);
  await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(page.getByText("Showing 1–1 of 1 product", { exact: true })).toBeVisible();

  // Delete (with confirmation) and check the list updates without a reload
  await page.getByRole("button", { name: `Delete ${name}` }).click();
  const dialog = page.getByRole("dialog", { name: "Delete product?" });
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Product deleted")).toBeVisible();
  await expect(page.getByText("No products found.")).toBeVisible();
});

test("edits a product in a dialog and stays on the list", async ({ page }, testInfo) => {
  // Each project saves its own price, so the test passes whichever project runs first.
  const price = testInfo.project.name === "mobile" ? "2.85" : "2.75";

  await login(page, ADMIN);
  await page.goto("/products?search=Espresso");
  await page.getByRole("link", { name: "Edit Espresso" }).click();

  const form = page.getByRole("dialog", { name: /^Edit product/ });
  await expect(form.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Espresso");
  await form.getByRole("spinbutton", { name: "Price", exact: true }).fill(price);
  await form.getByRole("button", { name: "Save changes" }).click();

  // The dialog closes and the list underneath shows the new price without a reload.
  await expect(form).toBeHidden();
  await expect(page.getByText("Changes saved")).toBeVisible();
  await expect(page).toHaveURL(/\/products\?search=Espresso$/);
  await expect(page.getByText(`$${price}`).filter({ visible: true })).toBeVisible();

  // Cancel closes the dialog without saving.
  await page.getByRole("link", { name: "Edit Espresso" }).click();
  await form.getByRole("button", { name: "Cancel" }).click();
  await expect(form).toBeHidden();
  await expect(page).toHaveURL(/\/products\?search=Espresso$/);
});

test("shows validation errors for invalid input", async ({ page }) => {
  await login(page, ADMIN);
  // Opened directly, the form is a full page rather than a dialog.
  await page.goto("/products/new");
  await expect(page.getByRole("heading", { name: "New product", level: 1 })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Hi");
  await page.getByRole("spinbutton", { name: "Price", exact: true }).fill("0");
  await page.getByRole("button", { name: "Create product" }).click();

  await expect(page.getByText("Name must be at least 3 characters.")).toBeVisible();
  await expect(page.getByText("Price must be greater than 0.")).toBeVisible();
  await expect(page.getByText("Category is required.")).toBeVisible();
});

test("search, filters and pagination work together and are kept in the URL", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/products");

  await page.getByLabel("Search by name").fill("pizza");
  await expect(page).toHaveURL(/search=pizza/);
  await selectOption(page, "Status", "Active");
  await selectOption(page, "Category", "Food");

  await expect(page).toHaveURL(/search=pizza&status=active&category=food/);
  await expect(page.getByText("Showing 1–4 of 4 products")).toBeVisible();
  await expect(page.getByRole("link", { name: "Vegetarian Pizza", exact: true })).toHaveCount(0);

  // The view is restored from the URL after a reload.
  await page.reload();
  await expect(page.getByLabel("Search by name")).toHaveValue("pizza");
  await expect(page.getByText("Showing 1–4 of 4 products")).toBeVisible();

  await page.goto("/products?page=2");
  await expect(page.getByText(/Showing 11–20 of \d+ products/)).toBeVisible();

  // Changing the page size goes back to the first page.
  await selectOption(page, "Rows per page", "20");
  await expect(page).toHaveURL(/pageSize=20/);
  await expect(page.getByText(/Showing 1–20 of \d+ products/)).toBeVisible();
});

test("manager can change status but cannot delete", async ({ page }) => {
  await login(page, MANAGER);
  await page.goto("/products?search=Classic%20Burger");

  await expect(page.getByRole("link", { name: "Classic Burger", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Delete / })).toHaveCount(0);

  await page.getByRole("link", { name: "Classic Burger", exact: true }).click();
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);

  const toggle = page.getByRole("button", { name: /^(Deactivate|Activate)$/ });
  const before = await toggle.textContent();
  await toggle.click();
  await expect(page.getByText(/Classic Burger is now (active|inactive)/)).toBeVisible();
  await expect(toggle).not.toHaveText(before ?? "");
});
