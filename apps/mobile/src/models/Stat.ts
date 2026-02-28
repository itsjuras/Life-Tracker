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
