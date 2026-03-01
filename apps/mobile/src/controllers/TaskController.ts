import { supabase } from '../services/supabase';
import { Task } from '../models/Task';

function mapTask(row: any): Task {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    title: row.title,
    completed: row.completed,
    sortOrder: row.sort_order,
  };
}

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.user.id;
}

export async function fetchTasksForDate(date: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('date', date)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapTask);
}

export async function createTask(date: string, title: string, sortOrder: number): Promise<Task> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, date, title, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return mapTask(data);
}

export async function toggleTask(taskId: string, completed: boolean): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return mapTask(data);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw error;
}
