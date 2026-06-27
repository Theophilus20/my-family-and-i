import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendContactEmails } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();
    
    if (!name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || !message?.trim()) {
      return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
    }

    // 1. Save to DB
    await query(
      'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
      [name.trim(), email.trim().toLowerCase(), message.trim()]
    );

    // 2. Send Emails (Admin Notification + User Auto-reply)
    try {
      await sendContactEmails(name.trim(), email.trim(), message.trim());
    } catch (e) {
      console.error('Email failed:', e);
      // Continue anyway since DB save worked
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
