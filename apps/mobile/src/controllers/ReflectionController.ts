import { supabase } from '../services/supabase';
import { ReflectionEntry } from '../models/Reflection';

function mapEntry(row: any): ReflectionEntry {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    text: row.text,
  };
}

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.user.id;
}

export async function fetchReflection(date: string): Promise<ReflectionEntry | null> {
  const { data, error } = await supabase
    .from('reflection_entries')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEntry(data) : null;
}

export async function saveReflection(date: string, text: string): Promise<ReflectionEntry> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('reflection_entries')
    .upsert({ user_id: userId, date, text }, { onConflict: 'user_id,date' })
    .select()
    .single();
  if (error) throw error;
  return mapEntry(data);
}
