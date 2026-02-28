// Shared TypeScript types used by both the mobile app and the API.

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

export interface Task {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  completed: boolean;
  sortOrder: number;
}

export interface StatDefinition {
  id: string;
  userId: string;
  key: string;
  label: string;
  unit: string;
  enabled: boolean;
}

export interface StatEntry {
  id: string;
  statDefinitionId: string;
  date: string; // YYYY-MM-DD
  value: number;
}

export interface ReflectionEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  text: string;
}
