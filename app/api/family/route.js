// app/api/family/route.js
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { listMembers, createInvite, updateMemberRole, removeMember } from '@/lib/family';
import { enforceFeature, enforceFamilyMemberLimit } from '@/lib/enforce';
import { queryOne } from '@/lib/db';
import { sendFamilyInviteEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const rows = await listMembers(userId);
    return NextResponse.json(rows);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load family members' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    await enforceFeature(userId, 'family');
    await enforceFamilyMemberLimit(userId);
    const { email, role } = await req.json();
    const row = await createInvite(userId, { email, role });

        // Send the invite email (don't fail the request if email errors).
    try {
      const inviter = await queryOne('SELECT name FROM users WHERE id = $1', [userId]);
      await sendFamilyInviteEmail(
        row.invite_email,
        inviter?.name || 'Someone',
        row.role,
        row.invite_token
      );
    } catch {}

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not create invite' }, { status: 400 });
  }
}

export async function PATCH(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { id, role } = await req.json();
    const row = await updateMemberRole(userId, id, role);
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not update role' }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { id } = await req.json();
    const result = await removeMember(userId, id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not remove member' }, { status: 400 });
  }
}