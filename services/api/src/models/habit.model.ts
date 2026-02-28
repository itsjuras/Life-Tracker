import { pool } from '../config/db';

export async function getHabitsByUser(userId: string) {
  const { rows } = await pool.query(
    'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at',
    [userId],
  );
  return rows;
}

export async function createHabit(userId: string, name: string, iconKey: string) {
  const { rows } = await pool.query(
    'INSERT INTO habits (user_id, name, icon_key) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, iconKey],
  );
  return rows[0];
}

export async function updateHabit(id: string, fields: { name?: string; iconKey?: string }) {
  const { rows } = await pool.query(
    'UPDATE habits SET name = COALESCE($2, name), icon_key = COALESCE($3, icon_key) WHERE id = $1 RETURNING *',
    [id, fields.name, fields.iconKey],
  );
  return rows[0];
}

export async function upsertHabitEntry(habitId: string, date: string, completed: boolean) {
  const { rows } = await pool.query(
    `INSERT INTO habit_entries (habit_id, date, completed)
     VALUES ($1, $2, $3)
     ON CONFLICT (habit_id, date) DO UPDATE SET completed = EXCLUDED.completed
     RETURNING *`,
    [habitId, date, completed],
  );
  return rows[0];
}

export async function getHabitEntriesByDate(userId: string, date: string) {
  const { rows } = await pool.query(
    `SELECT he.* FROM habit_entries he
     JOIN habits h ON h.id = he.habit_id
     WHERE h.user_id = $1 AND he.date = $2`,
    [userId, date],
  );
  return rows;
}
