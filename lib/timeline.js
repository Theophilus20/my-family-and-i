import { query } from '@/lib/db';

export async function listTimeline(userId) {
  const rows = await query(
    `SELECT id, year, title, description, created_at
       FROM timeline_events
      WHERE user_id = $1
      ORDER BY year ASC, created_at ASC`,
    [userId]
  );

  // Group flat rows into { year, items[] } the way the Timeline page expects.
  const byYear = new Map();
  for (const row of rows) {
    if (!byYear.has(row.year)) byYear.set(row.year, []);
    byYear.get(row.year).push(row);
  }
  return Array.from(byYear.entries()).map(([year, items]) => ({ year, items }));
}

export async function createEvent(userId, { year, title, description }) {
  const rows = await query(
    `INSERT INTO timeline_events (user_id, year, title, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, year, title, description, created_at`,
    [userId, year, title, description || '']
  );
  return rows[0];
}
export async function deleteEvent(userId, id) {
  const rows = await query(`DELETE FROM timeline_events WHERE user_id = $1 AND id = $2 RETURNING id`, [userId, id]);
  return rows[0] || null;
}