// app/api/memories/route.js
import { NextResponse } from 'next/server';
import { listMemories, createMemory, deleteMemory, updateMemory } from '@/lib/memories';
import { resolveVaultFromQuery, resolveVaultFromBody } from '@/lib/vault-access';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const access = await resolveVaultFromQuery(req);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const type = req.nextUrl.searchParams.get('type') || undefined;
    const rows = await listMemories(access.vaultId, { type });
    return NextResponse.json(rows);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load memories' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const row = await createMemory(access.vaultId, body);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {

    return NextResponse.json({ error: err.message || 'Could not save memory' }, { status: 400 });
  }
}
export async function DELETE(req) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    await deleteMemory(access.vaultId, body.id);
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
    const row = await updateMemory(access.vaultId, body.id, body); // swap fn per route
    return NextResponse.json(row);
  } catch (err) {

    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}