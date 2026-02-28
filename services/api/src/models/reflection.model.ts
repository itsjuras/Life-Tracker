import { pool } from '../config/db';

export async function getReflection(userId: string, date: string) {
  const { rows } = await pool.query(
    'SELECT * FROM reflection_entries WHERE user_id = $1 AND date = $2',
    [userId, date],
  );
  return rows[0] ?? null;
}

export async function upsertReflection(userId: string, date: string, text: string) {
  const { rows } = await pool.query(
    `INSERT INTO reflection_entries (user_id, date, text)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE SET text = EXCLUDED.text
     RETURNING *`,
    [userId, date, text],
  );
  return rows[0];
}
