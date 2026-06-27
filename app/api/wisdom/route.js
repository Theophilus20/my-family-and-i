// app/api/wisdom/route.js
import { NextResponse } from 'next/server';
import { listWisdom, createWisdom, deleteWisdom, updateWisdom } from '@/lib/wisdom';
import { resolveVaultFromQuery, resolveVaultFromBody } from '@/lib/vault-access';
import { enforceFeature } from '@/lib/enforce';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const access = await resolveVaultFromQuery(req);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const category = req.nextUrl.searchParams.get('category') || undefined;
    const rows = await listWisdom(access.vaultId, { category });
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Could not load wisdom' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    await enforceFeature(access.vaultId, 'wisdom');
    const row = await createWisdom(access.vaultId, body);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not save lesson' }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    await deleteWisdom(access.vaultId, body.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}
export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const row = await updateWisdom(access.vaultId, body.id, body);
    return NextResponse.json(row);
  } catch (err) {

    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}