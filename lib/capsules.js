import { query } from '@/lib/db';

// Derive locked/unlocked from the unlock date on the server, and NEVER send the
// message of a locked capsule to the client. Privacy is enforced in the data
// layer, not in the UI.
function shape(row) {
  if (!row) return row;
  const locked = new Date(row.unlock_date) > new Date();
  return {
    id: row.id,
    title: row.title,
    unlock_date: row.unlock_date,
    recipient_id: row.recipient_id ?? null,
    status: locked ? 'locked' : 'unlocked',
    message: locked ? null : row.message,
  };
}

export async function listCapsules(userId, viewerId = null) {
  // Owner sees all their capsules. A visitor only sees capsules addressed to
  // everyone (recipient_id NULL) or addressed specifically to them.
  const isOwner = !viewerId || viewerId === userId;
  const rows = isOwner
    ? await query(
        `SELECT id, title, message, unlock_date, recipient_id, created_at
           FROM capsules
          WHERE user_id = $1
          ORDER BY unlock_date ASC`,
        [userId]
      )
    : await query(
        `SELECT id, title, message, unlock_date, recipient_id, created_at
           FROM capsules
          WHERE user_id = $1
            AND (recipient_id IS NULL OR recipient_id = $2)
          ORDER BY unlock_date ASC`,
        [userId, viewerId]
      );
  return rows.map(shape);
}

export async function createCapsule(userId, { title, message, unlock_date, recipient_id }) {
  const rows = await query(
    `INSERT INTO capsules (user_id, title, message, unlock_date, recipient_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, message, unlock_date, recipient_id, created_at`,
    [userId, title, message || '', unlock_date, recipient_id ?? null]
  );
  return shape(rows[0]);
}

export async function deleteCapsule(userId, id) {
  const rows = await query(`DELETE FROM capsules WHERE user_id = $1 AND id = $2 RETURNING id`, [userId, id]);
  return rows[0] || null;
}

export async function updateCapsule(userId, id, { title, message, unlock_date, recipient_id }) {
  const rows = await query(
    `UPDATE capsules SET title=$3, message=$4, unlock_date=$5, recipient_id=$6
      WHERE user_id=$1 AND id=$2
      RETURNING id, title, message, unlock_date, recipient_id, created_at`,
    [userId, id, title, message ?? null, unlock_date, recipient_id ?? null]
  );
  return shape(rows[0] || null);
}