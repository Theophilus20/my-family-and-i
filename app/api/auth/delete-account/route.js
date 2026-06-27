// app/api/auth/delete-account/route.js
import { NextResponse } from 'next/server';
import { getSession, clearCookie } from '../../../../lib/auth';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const uid = session.id;

    // Remove the user's data first (safe even if FKs already cascade).
    await query('DELETE FROM memories            WHERE user_id = $1', [uid]).catch(() => {});
    await query('DELETE FROM capsules            WHERE user_id = $1', [uid]).catch(() => {});
    await query('DELETE FROM wisdom              WHERE user_id = $1', [uid]).catch(() => {});
    await query('DELETE FROM timeline_events     WHERE user_id = $1', [uid]).catch(() => {});
    await query('DELETE FROM chat_conversations  WHERE user_id = $1', [uid]).catch(() => {});
    await query('DELETE FROM notifications       WHERE user_id = $1', [uid]).catch(() => {});
    await query('DELETE FROM family_members      WHERE owner_id = $1 OR member_id = $1', [uid]).catch(() => {});
    // Finally the user.
    await query('DELETE FROM users WHERE id = $1', [uid]);

    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', clearCookie());
  return res;
} catch (err) {
  return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
}
}