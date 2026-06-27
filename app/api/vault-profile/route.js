// app/api/vault-profile/route.js
// Returns the public profile of a vault (the owner's name, bio, birthdate, photo).
// Access is checked: the viewer must own or have an active share to that vault.

import { NextResponse } from 'next/server';
import { resolveVaultFromQuery } from '@/lib/vault-access';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const access = await resolveVaultFromQuery(req);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

    const row = await queryOne(
      'SELECT name, bio, birthdate, avatar_url FROM users WHERE id = $1',
      [access.vaultId]
    );
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      name: row.name || '',
      bio: row.bio || '',
      birthdate: row.birthdate ? String(row.birthdate).slice(0, 10) : '',
      avatar_url: row.avatar_url || null,
      role: access.role,
    });
  } catch (err) {

    return NextResponse.json({ error: 'Could not load profile' }, { status: 500 });
  }
}