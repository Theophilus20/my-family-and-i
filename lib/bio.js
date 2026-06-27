import { query } from '@/lib/db';

export async function listChapters(userId) {
  return query(
    `SELECT id, chapter_num, title, years, summary, lessons, created_at
       FROM bio_chapters
      WHERE user_id = $1
      ORDER BY chapter_num ASC`,
    [userId]
  );
}

export async function addChapter(userId, { title, years, summary, lessons }) {
  // Next chapter number = current max + 1, computed server-side.
  const maxRows = await query(
    `SELECT COALESCE(MAX(chapter_num), 0) AS max FROM bio_chapters WHERE user_id = $1`,
    [userId]
  );
  const nextNum = Number(maxRows[0].max) + 1;

  const rows = await query(
    `INSERT INTO bio_chapters (user_id, chapter_num, title, years, summary, lessons)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, chapter_num, title, years, summary, lessons, created_at`,
    [userId, nextNum, title, years || '', summary || '', JSON.stringify(lessons || [])]
  );
  return rows[0];
}
export async function deleteChapter(userId, id) {
  await query('DELETE FROM bio_chapters WHERE id = $1 AND user_id = $2', [id, userId]);
  return { ok: true };
}