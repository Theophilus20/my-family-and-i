// app/api/billing/cancel/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

function fmtDate(d) {
  if (!d) return 'the end of your billing period';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  catch { return 'the end of your billing period'; }
}

export async function POST(req) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = await queryOne('SELECT id, plan, current_period_end FROM users WHERE id = $1', [session.id]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.plan === 'free') return NextResponse.json({ error: 'Already on Free' }, { status: 400 });

    const row = await queryOne(
      `UPDATE users
         SET subscription_status = 'cancelling', scheduled_plan = NULL
       WHERE id = $1
       RETURNING id, plan, subscription_status, current_period_end`,
      [session.id]
    );

    const planName = row.plan.charAt(0).toUpperCase() + row.plan.slice(1);
    const endStr = fmtDate(row.current_period_end);

    // Notify the user about the scheduled cancellation.
    try {
      await createNotification(session.id, {
        type: 'billing',
        title: 'Subscription cancelled',
        body: `Your ${planName} plan is set to cancel on ${endStr}. You'll keep full access until then, after which you'll move to Free.`,
      });
       } catch (e) {
    }

    return NextResponse.json({ ok: true, status: row.subscription_status, current_period_end: row.current_period_end });
  } catch {
    return NextResponse.json({ error: 'Could not cancel' }, { status: 500 });
  }
}