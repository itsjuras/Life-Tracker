// Returns today's date string in YYYY-MM-DD format.
export function useToday(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
