// app/api/vaults/route.js
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { listAccessibleVaults } from '@/lib/family';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const vaults = await listAccessibleVaults(userId);
    return NextResponse.json(vaults);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load vaults' }, { status: 500 });
  }
}