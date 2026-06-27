import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { listConversations, saveConversation } from '@/lib/chats';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const vaultUserId = req.nextUrl.searchParams.get('vault') || null;
    const rows = await listConversations(userId, vaultUserId);
    return NextResponse.json(rows);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load conversations' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const body = await req.json();
    const row = await saveConversation(userId, body);
    return NextResponse.json(row, { status: 200 });
  } catch (err) {

    return NextResponse.json({ error: err.message || 'Could not save conversation' }, { status: 400 });
  }
}