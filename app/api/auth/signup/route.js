// app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { query, queryOne } from '../../../../lib/db';
import { hashPassword, signToken, sessionCookie } from '../../../../lib/auth';
import { sendVerificationEmail } from '../../../../lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { name, email, password, plan } = await req.json();

    // --- validate ---
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const normEmail = email.trim().toLowerCase();

    // --- check duplicate ---
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [normEmail]);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // --- create (with a verification token) ---
    const password_hash = await hashPassword(password);
    const verifyToken = randomBytes(32).toString('hex');
    const rows = await query(
      `INSERT INTO users (name, email, password_hash, plan, email_verified, verification_token, verification_sent_at)
       VALUES ($1, $2, $3, 'free', false, $4, now())
       RETURNING id, name, email, plan`,
      [name.trim(), normEmail, password_hash, verifyToken]
    );
    const user = rows[0];

    // --- send the verification email (don't fail signup if email errors) ---
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken, plan);
    } catch (mailErr) {

    }

    // --- log them in (allowed in, but unverified) ---
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ user });
    res.headers.set('Set-Cookie', sessionCookie(token));
    return res;
  } catch (err) {

    return NextResponse.json({ error: 'Could not create account.' }, { status: 500 });
  }
}