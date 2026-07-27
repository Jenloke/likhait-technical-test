import { test, expect } from "@playwright/test";

// FEATURE-001: creating categories from both entry points, and duplicate
// rejection.
test("creates a category from the page header and sees it in the expense form", async ({
  page,
}) => {
  const categoryName = `E2E Header Category ${Date.now()}`;

  await page.goto("/");
  await page.getByRole("button", { name: "+ Add Category" }).first().click();

  await page.getByLabel("Category Name").fill(categoryName);
  await page.getByRole("button", { name: /Choose 🍔 emoji/ }).click();
  await page.getByRole("button", { name: "Add Category", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "Add Category" }),
  ).not.toBeVisible();

  await page.getByRole("button", { name: "Add Expense", exact: true }).click();
  await expect(
    page.getByRole("option", { name: new RegExp(categoryName) }),
  ).toBeAttached();
});

test("creates a category from within the expense form and auto-selects it", async ({
  page,
}) => {
  const categoryName = `E2E Inline Category ${Date.now()}`;

  await page.goto("/");
  await page.getByRole("button", { name: "Add Expense", exact: true }).click();
  await page.getByRole("button", { name: "+ Add Category" }).last().click();

  await page.getByLabel("Category Name").fill(categoryName);
  await page.getByRole("button", { name: "Add Category", exact: true }).click();

  await expect(page.getByLabel("Category", { exact: true })).toHaveValue(
    categoryName,
  );
});

test("rejects creating a category with a name that already exists", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "+ Add Category" }).first().click();

  await page.getByLabel("Category Name").fill("food");
  await page.getByRole("button", { name: "Add Category", exact: true }).click();

  await expect(
    page.getByText("A category with this name already exists"),
  ).toBeVisible();
});
