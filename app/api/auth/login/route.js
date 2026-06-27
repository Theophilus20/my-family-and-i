// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { verifyPassword, signToken, sessionCookie } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normEmail = email.trim().toLowerCase();
    const user = await queryOne(
      'SELECT id, name, email, plan, password_hash FROM users WHERE email = $1',
      [normEmail]
    );

    const ok = user && (await verifyPassword(password, user.password_hash));
    if (!ok) {
      return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
    });
    res.headers.set('Set-Cookie', sessionCookie(token));
    return res;
  } catch (err) {

    return NextResponse.json({ error: 'Could not log in.' }, { status: 500 });
  }
}