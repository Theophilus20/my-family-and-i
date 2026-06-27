// app/api/invite/[token]/route.js
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { getInviteByToken, acceptInvite } from '@/lib/family';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const invite = await getInviteByToken(params.token);
    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    return NextResponse.json({
      owner_name: invite.owner_name,
      invite_email: invite.invite_email,
      role: invite.role,
      status: invite.status,
    });
  } catch (err) {

    return NextResponse.json({ error: 'Could not load invite' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Please log in or sign up first.' }, { status: 401 });
    const result = await acceptInvite(params.token, userId);
    return NextResponse.json(result);
  } catch (err) {

    return NextResponse.json({ error: err.message || 'Could not accept invite' }, { status: 400 });
  }
}