// lib/permissions.js
// role is one of: 'owner' | 'viewer' | 'access' | null

// Only the vault owner can add / edit / delete.
export function canEdit(role) {
  return role === 'owner';
}

// Access can chat; viewers cannot.
export function canChat(role) {
  return role === 'owner' || role === 'access';
}

// Access can open capsules; viewers cannot.
export function canOpenCapsule(role) {
  return role === 'owner' || role === 'access';
}

// Owner-only sections: Overview, AI Biographer, Family Vault, Billing.
export function canSeeOwnerPages(role) {
  return role === 'owner';
}

// The Digital Personality page is hidden from viewers.
export function canSeePersonality(role) {
  return canChat(role);
}

// The active role for the current vault view.
export function vaultRole(isOwnerView, activeVault) {
  return isOwnerView ? 'owner' : (activeVault?.role || null);
}