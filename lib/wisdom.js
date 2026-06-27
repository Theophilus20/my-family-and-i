import { query } from '@/lib/db';

export async function listWisdom(userId, { category } = {}) {
  if (category && category !== 'All') {
    return query(
      `SELECT id, category, lesson, source, created_at
         FROM wisdom
        WHERE user_id = $1 AND category = $2
        ORDER BY created_at DESC`,
      [userId, category]
    );
  }
  return query(
    `SELECT id, category, lesson, source, created_at
       FROM wisdom
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  );
}

export async function createWisdom(userId, { category, lesson, source }) {
  const rows = await query(
    `INSERT INTO wisdom (user_id, category, lesson, source)
     VALUES ($1, $2, $3, $4)
     RETURNING id, category, lesson, source, created_at`,
    [userId, category || 'Life', lesson, source || '']
  );
  return rows[0];
}
export async function deleteWisdom(userId, id) {
  const rows = await query(
    `DELETE FROM wisdom WHERE user_id = $1 AND id = $2 RETURNING id`,
    [userId, id]
  );
  return rows[0] || null;
}
export async function updateWisdom(userId, id, { category, lesson, source }) {
  const rows = await query(
    `UPDATE wisdom SET category=$3, lesson=$4, source=$5
      WHERE user_id=$1 AND id=$2
      RETURNING id, category, lesson, source, created_at`,
    [userId, id, category, lesson, source ?? null]
  );
  return rows[0] || null;
}