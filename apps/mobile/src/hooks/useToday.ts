// Returns today's date string in YYYY-MM-DD format using local time.
// toISOString() must NOT be used here — it returns UTC, which can differ
// from the device's local date (e.g. UTC+1 at 11pm shows the next day).
export function useToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
