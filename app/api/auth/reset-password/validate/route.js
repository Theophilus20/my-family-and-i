import { NextResponse } from 'next/server';
import { queryOne } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false });
  const row = await queryOne(
    `SELECT id FROM users WHERE reset_token = $1 AND reset_sent_at > now() - interval '1 hour'`,
    [token]
  );
  return NextResponse.json({ valid: !!row });
}