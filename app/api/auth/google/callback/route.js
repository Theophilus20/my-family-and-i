// app/api/auth/google/callback/route.js
import { NextResponse } from 'next/server';
import { query, queryOne } from '../../../../../lib/db';
import { signToken, sessionCookie } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const PAID_PLANS = ['premium', 'family'];

export async function GET(req) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.redirect(`${APP_URL}/login?error=google`);

    // Recover the selected plan from the OAuth state, if any.
    let plan = '';
    try {
      const state = req.nextUrl.searchParams.get('state');
      if (state) plan = (JSON.parse(state).plan || '').toLowerCase();
    } catch { plan = ''; }

    // 1. Exchange the code for tokens.
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) {

      return NextResponse.redirect(`${APP_URL}/login?error=google`);
    }

    // 2. Fetch the user's profile.
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();
    const email = (profile.email || '').toLowerCase();
    const name = profile.name || email.split('@')[0];
    if (!email) return NextResponse.redirect(`${APP_URL}/login?error=google`);

    // 3. Find or create the user. Google emails are pre-verified.
    let user = await queryOne('SELECT id, name, email FROM users WHERE email = $1', [email]);
    if (!user) {
      const rows = await query(
        `INSERT INTO users (name, email, password_hash, plan, email_verified)
         VALUES ($1, $2, '', 'free', true)
         RETURNING id, name, email`,
        [name, email]
      );
      user = rows[0];
    } else {
      await query('UPDATE users SET email_verified = true WHERE id = $1', [user.id]);
    }

    // 4. Set our session cookie. Paid-plan signups go to checkout; others to the dashboard.
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    const dest = PAID_PLANS.includes(plan) ? `/checkout?plan=${plan}` : '/dashboard';
    const res = NextResponse.redirect(`${APP_URL}${dest}`);
    res.headers.set('Set-Cookie', sessionCookie(token));
    return res;
  } catch (err) {

    return NextResponse.redirect(`${APP_URL}/login?error=google`);
  }
}