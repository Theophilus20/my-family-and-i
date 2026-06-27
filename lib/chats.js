// lib/chats.js
import { query, queryOne } from './db';

export async function listConversations(userId, vaultUserId) {
  const vid = vaultUserId || userId;
  return query(
    `SELECT id, title, updated_at
       FROM chat_conversations
      WHERE user_id = $1 AND vault_user_id = $2
      ORDER BY updated_at DESC`,
    [userId, vid]
  );
}

export async function getConversation(userId, id) {
  return queryOne(
    `SELECT id, title, messages, updated_at
       FROM chat_conversations
      WHERE user_id = $1 AND id = $2`,
    [userId, id]
  );
}

// Create or update a conversation. If id is given, update it; else insert new.
export async function saveConversation(userId, { id, title, messages, vaultUserId }) {
  const msgJson = JSON.stringify(messages || []);
  const vid = vaultUserId || userId;
  if (id) {
    return queryOne(
      `UPDATE chat_conversations
          SET messages = $3::jsonb, title = COALESCE($4, title), updated_at = now()
        WHERE user_id = $1 AND id = $2
        RETURNING id, title, updated_at`,
      [userId, id, msgJson, title || null]
    );
  }
  return queryOne(
    `INSERT INTO chat_conversations (user_id, vault_user_id, title, messages)
     VALUES ($1, $2, $3, $4::jsonb)
     RETURNING id, title, updated_at`,
    [userId, vid, title || 'New conversation', msgJson]
  );
}

export async function deleteConversation(userId, id) {
  await query(`DELETE FROM chat_conversations WHERE user_id = $1 AND id = $2`, [userId, id]);
  return { deleted: true };
}