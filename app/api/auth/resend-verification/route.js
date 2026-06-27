import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getSession } from '../../../../lib/auth';
import { queryOne } from '../../../../lib/db';
import { sendVerificationEmail } from '../../../../lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = await queryOne('SELECT id, name, email, email_verified FROM users WHERE id = $1', [session.id]);
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (user.email_verified) return NextResponse.json({ ok: true, already: true });

    const token = randomBytes(32).toString('hex');
    await queryOne('UPDATE users SET verification_token = $2, verification_sent_at = now() WHERE id = $1 RETURNING id', [user.id, token]);
    await sendVerificationEmail(user.email, user.name, token);
    return NextResponse.json({ ok: true });
  } catch (err) {

    return NextResponse.json({ error: 'Could not resend' }, { status: 500 });
  }
}