// Mirrors frontend/src/utils/expenseUtils.ts#formatDate: local calendar
// date, zero-padded. Using Date#toISOString() instead would report the UTC
// date, which is a day off from the app's own "today" whenever the local
// timezone is ahead of UTC.
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
