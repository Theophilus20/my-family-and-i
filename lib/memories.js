import { query } from '@/lib/db';

const VALID_TYPES = ['Story', 'Photo', 'Letter', 'Lesson'];

export async function listMemories(userId, { type } = {}) {
  if (type && VALID_TYPES.includes(type)) {
    return query(
      `SELECT id, type, title, body, file_url, created_at
         FROM memories
        WHERE user_id = $1 AND type = $2
        ORDER BY created_at DESC`,
      [userId, type]
    );
  }
  return query(
    `SELECT id, type, title, body, file_url, created_at
       FROM memories
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  );
}

export async function createMemory(userId, { type, title, body, file_url }) {
  const rows = await query(
    `INSERT INTO memories (user_id, type, title, body, file_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, type, title, body, file_url, created_at`,
    [userId, type || 'Story', title, body || '', file_url || null]
  );
  return rows[0];
}

export async function deleteMemory(userId, id) {
  const rows = await query(
    `DELETE FROM memories WHERE user_id = $1 AND id = $2 RETURNING id`,
    [userId, id]
  );
  return rows[0] || null;
}

export async function updateMemory(userId, id, { type, title, body, file_url }) {
  const rows = await query(
    `UPDATE memories SET type=$3, title=$4, body=$5, file_url=$6
      WHERE user_id=$1 AND id=$2
      RETURNING id, type, title, body, file_url, created_at`,
    [userId, id, type, title?.trim(), body ?? null, file_url ?? null]
  );
  return rows[0] || null;
}