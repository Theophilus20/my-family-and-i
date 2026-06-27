// app/api/bio/route.js
import { NextResponse } from 'next/server';
import { listChapters, addChapter, deleteChapter } from '@/lib/bio';
import { resolveVaultFromQuery, resolveVaultFromBody } from '@/lib/vault-access';


export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const access = await resolveVaultFromQuery(req);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const rows = await listChapters(access.vaultId);
    return NextResponse.json(rows);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load chapters' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const row = await addChapter(access.vaultId, body);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not add chapter' }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const access = await resolveVaultFromQuery(req, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    await deleteChapter(access.vaultId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Could not delete chapter' }, { status: 400 });
  }
}