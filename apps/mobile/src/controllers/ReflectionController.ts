import { ReflectionEntry } from '../models/Reflection';
import * as api from '../services/api';

export async function fetchReflection(date: string): Promise<ReflectionEntry | null> {
  return api.get<ReflectionEntry | null>(`/v1/reflection?date=${date}`);
}

export async function saveReflection(date: string, text: string): Promise<ReflectionEntry> {
  return api.put<ReflectionEntry>('/v1/reflection', { date, text });
}
