import { Habit, HabitEntry } from '../models/Habit';
import * as api from '../services/api';

export async function fetchHabits(): Promise<Habit[]> {
  return api.get<Habit[]>('/v1/habits');
}

export async function fetchEntriesForDate(date: string): Promise<HabitEntry[]> {
  return api.get<HabitEntry[]>(`/v1/habits/entries?date=${date}`);
}

export async function toggleHabitEntry(
  habitId: string,
  date: string,
  completed: boolean,
): Promise<HabitEntry> {
  return api.post<HabitEntry>(`/v1/habits/${habitId}/entries`, { date, completed });
}

export async function createHabit(name: string, iconKey: string): Promise<Habit> {
  return api.post<Habit>('/v1/habits', { name, iconKey });
}
