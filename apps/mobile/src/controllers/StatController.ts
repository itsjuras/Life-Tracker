import { StatDefinition, StatEntry } from '../models/Stat';
import * as api from '../services/api';

export async function fetchStatDefinitions(): Promise<StatDefinition[]> {
  return api.get<StatDefinition[]>('/v1/stats');
}

export async function createStatDefinition(
  key: string,
  label: string,
  unit: string,
): Promise<StatDefinition> {
  return api.post<StatDefinition>('/v1/stats', { key, label, unit });
}

export async function logStatEntry(
  statId: string,
  date: string,
  value: number,
): Promise<StatEntry> {
  return api.post<StatEntry>(`/v1/stats/${statId}/entries`, { date, value });
}

export async function fetchStatEntries(
  statId: string,
  from: string,
  to: string,
): Promise<StatEntry[]> {
  return api.get<StatEntry[]>(`/v1/stats/${statId}/entries?from=${from}&to=${to}`);
}
