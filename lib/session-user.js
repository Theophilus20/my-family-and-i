// lib/session-user.js
// Resolves the current user from the session cookie. Returns null when there
// is no valid session — callers should treat that as "not authenticated".
import { getSession } from './auth';

export function getCurrentUserId(req) {
  const session = req ? getSession(req) : null;
  return session?.id || null;
}