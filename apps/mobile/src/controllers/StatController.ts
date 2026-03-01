import { supabase } from '../services/supabase';
import { StatDefinition, StatEntry } from '../models/Stat';

function mapStatDef(row: any): StatDefinition {
  return {
    id: row.id,
    userId: row.user_id,
    key: row.key,
    label: row.label,
    unit: row.unit,
    enabled: row.enabled,
  };
}

function mapStatEntry(row: any): StatEntry {
  return {
    id: row.id,
    statDefinitionId: row.stat_definition_id,
    date: row.date,
    value: row.value,
  };
}

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.user.id;
}

export async function fetchStatDefinitions(): Promise<StatDefinition[]> {
  const { data, error } = await supabase
    .from('stat_definitions')
    .select('*')
    .order('label', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStatDef);
}

export async function createStatDefinition(
  key: string,
  label: string,
  unit: string,
): Promise<StatDefinition> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('stat_definitions')
    .insert({ user_id: userId, key, label, unit })
    .select()
    .single();
  if (error) throw error;
  return mapStatDef(data);
}

export async function logStatEntry(
  statId: string,
  date: string,
  value: number,
): Promise<StatEntry> {
  const { data, error } = await supabase
    .from('stat_entries')
    .upsert(
      { stat_definition_id: statId, date, value },
      { onConflict: 'stat_definition_id,date' },
    )
    .select()
    .single();
  if (error) throw error;
  return mapStatEntry(data);
}

export async function fetchStatEntries(
  statId: string,
  from: string,
  to: string,
): Promise<StatEntry[]> {
  const { data, error } = await supabase
    .from('stat_entries')
    .select('*')
    .eq('stat_definition_id', statId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStatEntry);
}

export async function deleteStatDefinition(statId: string): Promise<void> {
  const { error } = await supabase
    .from('stat_definitions')
    .delete()
    .eq('id', statId);
  if (error) throw error;
}

export async function toggleStatEnabled(statId: string, enabled: boolean): Promise<StatDefinition> {
  const { data, error } = await supabase
    .from('stat_definitions')
    .update({ enabled })
    .eq('id', statId)
    .select()
    .single();
  if (error) throw error;
  return mapStatDef(data);
}
