import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { getConversation, deleteConversation } from '@/lib/chats';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const row = await getConversation(userId, params.id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load conversation' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const result = await deleteConversation(userId, params.id);
    return NextResponse.json(result);
  } catch (err) {

    return NextResponse.json({ error: 'Could not delete conversation' }, { status: 500 });
  }
}