import { pool } from '../config/db';

export async function getTasksByDate(userId: string, date: string) {
  const { rows } = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1 AND date = $2 ORDER BY sort_order',
    [userId, date],
  );
  return rows;
}

export async function createTask(
  userId: string,
  date: string,
  title: string,
  sortOrder: number,
) {
  const { rows } = await pool.query(
    'INSERT INTO tasks (user_id, date, title, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, date, title, sortOrder],
  );
  return rows[0];
}

export async function updateTask(id: string, fields: { title?: string; completed?: boolean; sortOrder?: number }) {
  const { rows } = await pool.query(
    `UPDATE tasks
     SET title       = COALESCE($2, title),
         completed   = COALESCE($3, completed),
         sort_order  = COALESCE($4, sort_order)
     WHERE id = $1
     RETURNING *`,
    [id, fields.title, fields.completed, fields.sortOrder],
  );
  return rows[0];
}

export async function deleteTask(id: string) {
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
}
