import { test, expect } from "@playwright/test";

// BUG-001: expenses must be ordered by date (desc), not by creation order.
// Uses a year/month before the seed data starts (Jan 2024) so the test is
// isolated from both the large seeded dataset and its client-side pagination.
test("a backdated expense is ranked by its date, not by when it was created", async ({
  page,
}) => {
  const suffix = Date.now();
  const laterDescription = `E2E later ${suffix}`;
  const earlierDescription = `E2E earlier ${suffix}`;

  await page.goto("/?year=2020&month=1");
  await expect(page.getByRole("heading", { name: "Expense History" })).toBeVisible();

  const addExpense = async (description: string, date: string) => {
    await page.getByRole("button", { name: "Add Expense", exact: true }).click();
    await page.getByLabel("Amount").fill("10");
    await page.getByLabel("Description").fill(description);
    await page.getByLabel("Category", { exact: true }).selectOption("Food");
    await page.getByLabel("Date").fill(date);
    await page
      .getByRole("button", { name: "Add Expense", exact: true })
      .last()
      .click();
    await expect(page.getByText(description)).toBeVisible();
  };

  // Created first, but dated later in the month.
  await addExpense(laterDescription, "2020-01-20");
  // Created second, but dated earlier -- a bug that sorted by creation time
  // (rather than by date) would place this one above the "later" expense.
  await addExpense(earlierDescription, "2020-01-10");

  // Compare relative position rather than asserting an exact row count, so
  // this test stays valid even when re-run locally against a dev database
  // that already has earlier E2E runs' rows in the same (otherwise unused)
  // 2020-01 month.
  const rowTexts = await page.locator("table tbody tr").allTextContents();
  const laterIndex = rowTexts.findIndex((text) => text.includes(laterDescription));
  const earlierIndex = rowTexts.findIndex((text) => text.includes(earlierDescription));

  expect(laterIndex).toBeGreaterThanOrEqual(0);
  expect(earlierIndex).toBeGreaterThanOrEqual(0);
  expect(laterIndex).toBeLessThan(earlierIndex);
});
