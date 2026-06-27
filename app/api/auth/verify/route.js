// app/api/auth/verify/route.js
import { NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });

    const user = await queryOne(
      `UPDATE users SET email_verified = true, verification_token = NULL
        WHERE verification_token = $1
          AND verification_sent_at > now() - interval '1 hour'
        RETURNING id, email`,
      [token]
    );

    if (!user) {
      return NextResponse.json({ ok: false, error: 'This link is invalid or has expired. Please request a new one.' }, { status: 400 });
    }
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Invalid or already-used link' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {

    return NextResponse.json({ ok: false, error: 'Verification failed' }, { status: 500 });
  }
}