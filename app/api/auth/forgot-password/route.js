import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { query, queryOne } from '../../../../lib/db';
import { sendPasswordResetEmail } from '../../../../lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email } = await req.json();
    const normEmail = (email || '').trim().toLowerCase();
    // Always respond success (don't reveal whether an email exists).
    if (!normEmail) return NextResponse.json({ ok: true });

    const user = await queryOne('SELECT id, name, email FROM users WHERE email = $1', [normEmail]);
    if (user) {
      const token = randomBytes(32).toString('hex');
      await query('UPDATE users SET reset_token = $2, reset_sent_at = now() WHERE id = $1', [user.id, token]);
      try { await sendPasswordResetEmail(user.email, user.name, token); } catch (e) { console.error('reset email failed', e); }
    }
    return NextResponse.json({ ok: true });
  } catch {
  return NextResponse.json({ ok: true }); // still generic
}
}