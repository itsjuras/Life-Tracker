export interface Task {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  completed: boolean;
  sortOrder: number;
}
