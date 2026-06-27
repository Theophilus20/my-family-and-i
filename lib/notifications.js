// lib/notifications.js
import { query, queryOne } from './db';

export async function createNotification(userId, { type, title, body }) {
  return queryOne(
    `INSERT INTO notifications (user_id, type, title, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id, type, title, body, read, created_at`,
    [userId, type, title, body || null]
  );
}

export async function listNotifications(userId, { limit = 30 } = {}) {
  return query(
    `SELECT id, type, title, body, read, created_at
       FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [userId, limit]
  );
}

export async function countUnread(userId) {
  const row = await queryOne(
    `SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND read = false`,
    [userId]
  );
  return row?.n || 0;
}

export async function markRead(userId, id) {
  await query(`UPDATE notifications SET read = true WHERE user_id = $1 AND id = $2`, [userId, id]);
  return { ok: true };
}

export async function markAllRead(userId) {
  await query(`UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`, [userId]);
  return { ok: true };
}

export async function deleteNotification(userId, id) {
  await query(`DELETE FROM notifications WHERE user_id = $1 AND id = $2`, [userId, id]);
  return { ok: true };
}