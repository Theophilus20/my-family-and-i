'use client';

import { withVault, getActiveVaultId } from '@/lib/active-vault';

async function handle(res) {
  if (!res.ok) {
    let msg = 'Request failed';
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

function vbody(body = {}) {
  const v = getActiveVaultId();
  return v ? { ...body, vaultUserId: v } : body;
}

const post = (path, body) =>
  fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vbody(body)) }).then(handle);

// Build a query string from the given params, skipping empty values.
function qs(params) {
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') clean[k] = v;
  }
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
}

export const api = {
  // Memories
  getMemories: (type, vaultId) =>
    fetch(`/api/memories${qs({ type, vault: vaultId })}`).then(handle),
  createMemory: (body) => post('/api/memories', body),

  // Capsules
  getCapsules: (vaultId) =>
    fetch(`/api/capsules${qs({ vault: vaultId })}`).then(handle),
  createCapsule: (body) => post('/api/capsules', body),

  // Wisdom
  getWisdom: (category, vaultId) =>
    fetch(`/api/wisdom${qs({ category: category && category !== 'All' ? category : undefined, vault: vaultId })}`).then(handle),
  createWisdom: (body) => post('/api/wisdom', body),

  // Timeline
  getTimeline: (vaultId) =>
    fetch(`/api/timeline${qs({ vault: vaultId })}`).then(handle),
  createEvent: (body) => post('/api/timeline', body),
  extractTimeline: () => post('/api/extract-timeline', {}),

  // Bio
  getChapters: (vaultId) =>
    fetch(`/api/bio${qs({ vault: vaultId })}`).then(handle),
  addChapter: (body) => post('/api/bio', body),
  generateChapter: () => post('/api/generate-chapter', {}),

  // Vault profile
  getVaultProfile: (vaultId) =>
    fetch(`/api/vault-profile${qs({ vault: vaultId })}`).then(handle),
   changePlan: (plan) =>
    fetch('/api/billing/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) }).then(handle),
  // Chat
  chat: (messages, vaultId) =>
    fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages, vaultUserId: vaultId || getActiveVaultId() || undefined }) }).then(handle),
  resendVerification: () =>
    fetch('/api/auth/resend-verification', { method: 'POST' }).then(handle),
  // Conversations (saved chat history) — always the viewer's own
  getConversations: (vaultId) =>
    fetch(`/api/conversations${qs({ vault: vaultId })}`).then(handle),
  getConversation: (id) => fetch(`/api/conversations/${id}`).then(handle),
  saveConversation: (body) =>
    fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handle),
  deleteConversation: (id) =>
    fetch(`/api/conversations/${id}`, { method: 'DELETE' }).then(handle),
saveAvatar: (avatar) =>
    fetch('/api/profile/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar }) }).then(handle),
  removeAvatar: () =>
    fetch('/api/profile/avatar', { method: 'DELETE' }).then(handle),
  // Family sharing
  getFamily: () => fetch('/api/family').then(handle),
  inviteFamily: (body) =>
    fetch('/api/family', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handle),
  updateFamilyRole: (id, role) =>
    fetch('/api/family', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role }) }).then(handle),
  removeFamily: (id) =>
    fetch('/api/family', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(handle),
  getNotifications: () => fetch('/api/notifications').then(handle),
  markNotificationRead: (id) =>
    fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(handle),
  markAllNotificationsRead: () =>
    fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }).then(handle),
  deleteNotification: (id) =>
    fetch('/api/notifications', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(handle),
  deleteMemory: (id) =>
    fetch('/api/memories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vbody({ id })) }).then(handle),
  deleteCapsule: (id) =>
    fetch('/api/capsules', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vbody({ id })) }).then(handle),
  deleteWisdom: (id) =>
    fetch('/api/wisdom', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vbody({ id })) }).then(handle),
  deleteEvent: (id) =>
    fetch('/api/timeline', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vbody({ id }))
 }).then(handle),
 updateMemory: (id, body) =>
    fetch('/api/memories', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vbody({ ...body, id })) }).then(handle),
updateWisdom: (id, body) =>
    fetch('/api/wisdom', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vbody({ ...body, id })) }).then(handle),
  updateCapsule: (id, body) =>
    fetch('/api/capsules', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vbody({ ...body, id })) }).then(handle),
deleteAccount: () =>
    fetch('/api/auth/delete-account', { method: 'POST' }).then(handle),
deleteChapter: (id) => fetch(`/api/bio?id=${id}`, { method: 'DELETE' }).then(handle),
flutterwaveInit: (plan, interval) =>
    fetch('/api/billing/flutterwave/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, interval }) }).then(handle),
flutterwaveVerify: (reference) =>
    fetch('/api/billing/flutterwave/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference }) }).then(handle),
  cancelSubscription: () =>
    fetch('/api/billing/cancel', { method: 'POST' }).then(handle),
  scheduleDowngrade: (plan) =>
    fetch('/api/billing/schedule-downgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) }).then(handle),
};