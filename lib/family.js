// lib/family.js
import { randomBytes } from 'node:crypto';
import { query, queryOne } from './db';

export async function listMembers(ownerId) {
  return query(
    `SELECT fm.id, fm.invite_email, fm.role, fm.status, fm.member_id, fm.created_at,
            u.name AS member_name, u.email AS member_email
       FROM family_members fm
       LEFT JOIN users u ON u.id = fm.member_id
      WHERE fm.owner_id = $1
      ORDER BY fm.created_at DESC`,
    [ownerId]
  );
}

export async function createInvite(ownerId, { email, role }) {
  const normEmail = (email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
    throw new Error('A valid email is required');
  }
  const validRole = ['viewer', 'access'].includes(role) ? role : 'viewer';
  const token = randomBytes(24).toString('hex');

  const existingUser = await queryOne('SELECT id FROM users WHERE email = $1', [normEmail]);

  return queryOne(
    `INSERT INTO family_members (owner_id, member_id, invite_email, role, status, invite_token)
     VALUES ($1, $2, $3, $4, 'pending', $5)
     ON CONFLICT (owner_id, invite_email)
       DO UPDATE SET role = EXCLUDED.role, status = 'pending', invite_token = EXCLUDED.invite_token
     RETURNING id, invite_email, role, status, invite_token, created_at`,
    [ownerId, existingUser?.id || null, normEmail, validRole, token]
  );
}

export async function updateMemberRole(ownerId, memberRowId, role) {
  const validRole = ['viewer', 'access'].includes(role) ? role : 'viewer';
  return queryOne(
    `UPDATE family_members SET role = $3
      WHERE owner_id = $1 AND id = $2
      RETURNING id, role`,
    [ownerId, memberRowId, validRole]
  );
}

export async function removeMember(ownerId, memberRowId) {
  await query(`DELETE FROM family_members WHERE owner_id = $1 AND id = $2`, [ownerId, memberRowId]);
  return { deleted: true };
}

export async function getInviteByToken(token) {
  return queryOne(
    `SELECT fm.id, fm.owner_id, fm.invite_email, fm.role, fm.status,
            o.name AS owner_name
       FROM family_members fm
       JOIN users o ON o.id = fm.owner_id
      WHERE fm.invite_token = $1`,
    [token]
  );
}

export async function acceptInvite(token, userId) {
  const invite = await getInviteByToken(token);
  if (!invite) throw new Error('This invite link is invalid or has expired.');
  if (invite.status === 'revoked') throw new Error('This invite has been revoked.');
  if (invite.owner_id === userId) throw new Error("You can't accept an invite to your own vault.");

  return queryOne(
    `UPDATE family_members
        SET member_id = $2, status = 'active', invite_token = NULL
      WHERE invite_token = $1
      RETURNING id, owner_id, role, status`,
    [token, userId]
  );
}

export async function listAccessibleVaults(userId) {
  const me = await queryOne('SELECT id, name FROM users WHERE id = $1', [userId]);
  const shared = await query(
    `SELECT fm.owner_id AS id, u.name, u.plan, fm.role
       FROM family_members fm
       JOIN users u ON u.id = fm.owner_id
      WHERE fm.member_id = $1 AND fm.status = 'active'
      ORDER BY u.name`,
    [userId]
  );
  return {
    own: me ? { id: me.id, name: me.name, role: 'owner' } : null,
    shared,
  };
}
export async function getVaultRole(viewerId, vaultOwnerId) {
  if (viewerId === vaultOwnerId) return 'owner';
  const row = await queryOne(
    `SELECT role FROM family_members
      WHERE member_id = $1 AND owner_id = $2 AND status = 'active'`,
    [viewerId, vaultOwnerId]
  );
  return row?.role || null;
}