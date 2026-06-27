// app/api/capsules/route.js
import { NextResponse } from 'next/server';
import { listCapsules, createCapsule, deleteCapsule, updateCapsule } from '@/lib/capsules';
import { resolveVaultFromQuery, resolveVaultFromBody } from '@/lib/vault-access';
import { enforceCapsuleLimit } from '@/lib/enforce';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const access = await resolveVaultFromQuery(req);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const rows = await listCapsules(access.vaultId, access.viewerId);
    return NextResponse.json(rows);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load capsules' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    await enforceCapsuleLimit(access.vaultId);
    const row = await createCapsule(access.vaultId, body);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not create capsule' }, { status: 400 });
  }
}
export async function DELETE(req) {
  try {
    const body = await req.json();
    if (!body?.id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }
   await deleteCapsule(access.vaultId, body.id);
return NextResponse.json({ ok: true });
} catch (err) {
  return NextResponse.json({ error: String(err?.message || err) }, { status: 400 });
}
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const access = await resolveVaultFromBody(req, body, { requireWrite: true });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const row = await updateCapsule(access.vaultId, body.id, body);
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 400 });
  }
}