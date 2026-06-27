// app/api/timeline/route.js
import { NextResponse } from 'next/server';
import { listTimeline, createEvent } from '@/lib/timeline';
import { resolveVaultFromQuery, resolveVaultFromBody } from '@/lib/vault-access';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const access = await resolveVaultFromQuery(req);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const rows = await listTimeline(access.vaultId);
    return NextResponse.json(rows);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load timeline' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const row = await createEvent(access.vaultId, body);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {

    return NextResponse.json({ error: err.message || 'Could not add event' }, { status: 400 });
  }
}