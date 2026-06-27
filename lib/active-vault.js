// lib/active-vault.js
let activeVaultId = null;

export function setActiveVaultId(id) {
  activeVaultId = id || null;
}

export function getActiveVaultId() {
  return activeVaultId;
}

export function withVault(path) {
  if (!activeVaultId) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}vault=${encodeURIComponent(activeVaultId)}`;
}