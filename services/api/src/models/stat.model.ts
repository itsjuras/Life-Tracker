import { pool } from '../config/db';

export async function getStatDefinitionsByUser(userId: string) {
  const { rows } = await pool.query(
    'SELECT * FROM stat_definitions WHERE user_id = $1',
    [userId],
  );
  return rows;
}

export async function createStatDefinition(
  userId: string,
  key: string,
  label: string,
  unit: string,
) {
  const { rows } = await pool.query(
    'INSERT INTO stat_definitions (user_id, key, label, unit) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, key, label, unit],
  );
  return rows[0];
}

export async function upsertStatEntry(statDefinitionId: string, date: string, value: number) {
  const { rows } = await pool.query(
    `INSERT INTO stat_entries (stat_definition_id, date, value)
     VALUES ($1, $2, $3)
     ON CONFLICT (stat_definition_id, date) DO UPDATE SET value = EXCLUDED.value
     RETURNING *`,
    [statDefinitionId, date, value],
  );
  return rows[0];
}

export async function getStatEntries(statDefinitionId: string, from: string, to: string) {
  const { rows } = await pool.query(
    'SELECT * FROM stat_entries WHERE stat_definition_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date',
    [statDefinitionId, from, to],
  );
  return rows;
}
