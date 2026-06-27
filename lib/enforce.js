// lib/enforce.js
import { queryOne } from './db';
import { getLimits } from './plans';

// Get the plan for a given user (vault owner).
async function getPlan(userId) {
  const row = await queryOne('SELECT plan FROM users WHERE id = $1', [userId]);
  return row?.plan || 'free';
}

// Throw if the vault owner is at/over their memory cap.
export async function enforceMemoryLimit(vaultId) {
  const plan = await getPlan(vaultId);
  const limit = getLimits(plan).maxMemories;
  if (limit === Infinity) return;
  const row = await queryOne('SELECT COUNT(*)::int AS n FROM memories WHERE user_id = $1', [vaultId]);
  if ((row?.n || 0) >= limit) {
    throw new Error(`You've reached the ${limit}-memory limit on the Free plan. Upgrade to add more.`);
  }
}

// Throw if the vault owner is at/over their capsule cap.
export async function enforceCapsuleLimit(vaultId) {
  const plan = await getPlan(vaultId);
  const limit = getLimits(plan).maxCapsules;
  if (limit === Infinity) return;
  const row = await queryOne('SELECT COUNT(*)::int AS n FROM capsules WHERE user_id = $1', [vaultId]);
  if ((row?.n || 0) >= limit) {
    throw new Error(`You've reached the ${limit}-capsule limit on the Free plan. Upgrade to add more.`);
  }
}

// Throw if the vault owner's plan doesn't include a feature.
export async function enforceFeature(vaultId, feature) {
  const plan = await getPlan(vaultId);
  const allowed = getLimits(plan).features[feature];
  if (!allowed) {
    throw new Error(`This feature requires an upgrade. The Free plan doesn't include ${feature}.`);
  }
}

// Throw if the owner is at/over their family-member limit (counts pending + active).
export async function enforceFamilyMemberLimit(ownerId) {
  const plan = await getPlan(ownerId);
  const limit = getLimits(plan).maxFamilyMembers;
  if (limit === Infinity) return;              // Family = unlimited
  if (limit === 0) {
    throw new Error('Family sharing requires an upgrade.');
  }
  const row = await queryOne(
    'SELECT COUNT(*)::int AS n FROM family_members WHERE owner_id = $1',
    [ownerId]
  );
  if ((row?.n || 0) >= limit) {
    throw new Error(`You've reached your ${limit}-member limit. Upgrade to Family for unlimited members.`);
  }
}