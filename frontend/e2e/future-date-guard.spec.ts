import { test, expect } from "@playwright/test";
import { toLocalDateString } from "./dateHelpers";

// BONUS-001: the date field must default to today, cap at today, and reject
// a future date with an explanatory message instead of silently submitting.
test("blocks a future-dated expense with an inline validation message", async ({
  page,
}) => {
  const today = toLocalDateString(new Date());
  const future = new Date();
  future.setDate(future.getDate() + 5);
  const futureIso = toLocalDateString(future);

  const uniqueDescription = `E2E future guard ${Date.now()}`;

  await page.goto("/");
  await page.getByRole("button", { name: "Add Expense", exact: true }).click();

  const dateInput = page.getByLabel("Date");
  await expect(dateInput).toHaveValue(today);
  await expect(dateInput).toHaveAttribute("max", today);

  await page.getByLabel("Amount").fill("10");
  await page.getByLabel("Description").fill(uniqueDescription);
  await page.getByLabel("Category").selectOption("Food");
  await dateInput.fill(futureIso);
  await page
    .getByRole("button", { name: "Add Expense", exact: true })
    .last()
    .click();

  await expect(
    page.getByText(
      "Date cannot be in the future. Please select today or an earlier date.",
    ),
  ).toBeVisible();

  // The expense must not have been created.
  await expect(page.getByText(uniqueDescription)).not.toBeVisible();
});
