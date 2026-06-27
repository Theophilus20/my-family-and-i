import { NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

    const hash = await hashPassword(password);
    const user = await queryOne(
      `UPDATE users SET password_hash = $2, reset_token = NULL
        WHERE reset_token = $1 AND reset_sent_at > now() - interval '1 hour'
        RETURNING id, email`,
      [token, hash]
    );
    if (!user) return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {

    return NextResponse.json({ error: 'Could not reset password.' }, { status: 500 });
  }
}