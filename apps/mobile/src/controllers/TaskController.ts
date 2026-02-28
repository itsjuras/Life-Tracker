import { Task } from '../models/Task';
import * as api from '../services/api';

export async function fetchTasksForDate(date: string): Promise<Task[]> {
  return api.get<Task[]>(`/v1/tasks?date=${date}`);
}

export async function createTask(date: string, title: string, sortOrder: number): Promise<Task> {
  return api.post<Task>('/v1/tasks', { date, title, sortOrder });
}

export async function toggleTask(taskId: string, completed: boolean): Promise<Task> {
  return api.patch<Task>(`/v1/tasks/${taskId}`, { completed });
}

export async function deleteTask(taskId: string): Promise<void> {
  return api.del(`/v1/tasks/${taskId}`);
}
