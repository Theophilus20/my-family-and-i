// app/api/billing/schedule-downgrade/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

const RANK = { free: 0, premium: 1, family: 2 };
const VALID = ['free', 'premium', 'family'];

export async function POST(req) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { plan } = await req.json();
    if (!VALID.includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const user = await queryOne('SELECT id, plan, current_period_end FROM users WHERE id = $1', [session.id]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (RANK[plan] >= RANK[user.plan]) {
      return NextResponse.json({ error: 'Use checkout to upgrade' }, { status: 400 });
    }

    const status = plan === 'free' ? 'cancelling' : 'active';
    const scheduled = plan === 'free' ? null : plan;

    const row = await queryOne(
      `UPDATE users
         SET scheduled_plan = $2, subscription_status = $3
       WHERE id = $1
       RETURNING id, plan, scheduled_plan, subscription_status, current_period_end`,
      [session.id, scheduled, status]
   );
return NextResponse.json({
  ok: true,
  scheduled_plan: row.scheduled_plan,
  current_period_end: row.current_period_end
});
} catch {
  return NextResponse.json(
    { error: 'Could not schedule downgrade' },
    { status: 500 }
  );
}
}