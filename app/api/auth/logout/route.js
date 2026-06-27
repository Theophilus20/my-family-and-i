// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { clearCookie } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearCookie());
  return res;
}