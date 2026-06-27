// lib/vault-access.js
import { getCurrentUserId } from './session-user';
import { getVaultRole } from './family';

export async function resolveVaultFromQuery(req) {
  const viewerId = getCurrentUserId(req);
  if (!viewerId) return { ok: false, status: 401, error: 'Not authenticated' };

  const requested = req.nextUrl?.searchParams?.get('vault') || null;
  const vaultId = requested || viewerId;

  const role = await getVaultRole(viewerId, vaultId);
  if (!role) return { ok: false, status: 403, error: 'You do not have access to this vault.' };

  return { ok: true, vaultId, role, viewerId };
}

export async function resolveVaultFromBody(req, body, { requireWrite = false } = {}) {
  const viewerId = getCurrentUserId(req);
  if (!viewerId) return { ok: false, status: 401, error: 'Not authenticated' };

  const vaultId = body?.vaultUserId || viewerId;
  const role = await getVaultRole(viewerId, vaultId);
  if (!role) return { ok: false, status: 403, error: 'You do not have access to this vault.' };

  if (requireWrite && !['owner'].includes(role)) {
    return { ok: false, status: 403, error: 'You have read-only access to this vault.' };
  }

  return { ok: true, vaultId, role, viewerId };
}