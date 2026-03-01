import { supabase } from '../services/supabase';
import { Habit, HabitEntry } from '../models/Habit';

function mapHabit(row: any): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    iconKey: row.icon_key,
    createdAt: row.created_at,
  };
}

function mapEntry(row: any): HabitEntry {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    completed: row.completed,
  };
}

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.user.id;
}

export async function fetchHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapHabit);
}

export async function fetchEntriesForDate(date: string): Promise<HabitEntry[]> {
  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('date', date);
  if (error) throw error;
  return (data ?? []).map(mapEntry);
}

export async function toggleHabitEntry(
  habitId: string,
  date: string,
  completed: boolean,
): Promise<HabitEntry> {
  const { data, error } = await supabase
    .from('habit_entries')
    .upsert({ habit_id: habitId, date, completed }, { onConflict: 'habit_id,date' })
    .select()
    .single();
  if (error) throw error;
  return mapEntry(data);
}

export async function createHabit(name: string, iconKey: string): Promise<Habit> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: userId, name, icon_key: iconKey })
    .select()
    .single();
  if (error) throw error;
  return mapHabit(data);
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId);
  if (error) throw error;
}
