export interface Habit {
  id: string;
  userId: string;
  name: string;
  iconKey: string;
  createdAt: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}
