// app/api/notifications/route.js
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session-user';
import { listNotifications, markRead, markAllRead, deleteNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const rows = await listNotifications(userId);
    return NextResponse.json(rows);
  } catch (err) {

    return NextResponse.json({ error: 'Could not load notifications' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { id, all } = await req.json();
    if (all) await markAllRead(userId);
    else if (id) await markRead(userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {

    return NextResponse.json({ error: 'Could not update' }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { id } = await req.json();
    if (id) await deleteNotification(userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {

    return NextResponse.json({ error: 'Could not delete' }, { status: 400 });
  }
}