// app/api/billing/flutterwave/verify/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID_PLANS = ['premium', 'family'];
const PLAN_PRICES = {
  premium: { monthly: 4.99, yearly: 59.88 },
  family:  { monthly: 14.99, yearly: 179.88 },
};

export async function POST(req) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { reference } = await req.json();
    if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

    // Flutterwave returns transaction_id; verify it.
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${reference}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
    });
    const data = await res.json();

    const tx = data.data;
    if (data.status !== 'success' || !tx || tx.status !== 'successful') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    const plan = tx.meta?.plan;
    const interval = tx.meta?.interval === 'yearly' ? 'yearly' : 'monthly';
    const paidUserId = tx.meta?.user_id;

    // Security: payment must belong to the logged-in user, plan valid.
    if (paidUserId !== session.id || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Payment mismatch' }, { status: 400 });
    }

    // Security: amount + currency must match the expected price.
    const expected = PLAN_PRICES[plan][interval];
    if (Number(tx.amount) < expected || tx.currency !== 'USD') {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Compute the period end from the interval (the period you just paid for).
    const now = new Date();
    const periodEnd = new Date(now);
    if (interval === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Activate the plan. A new subscription always resets status to active,
    // sets the new period end, and clears any pending downgrade.
    const row = await queryOne(
      `UPDATE users
         SET plan = $2,
             billing_interval = $3,
             subscription_status = 'active',
             current_period_end = $4,
             scheduled_plan = NULL
       WHERE id = $1
       RETURNING id, plan, billing_interval, current_period_end`,
      [session.id, plan, interval, periodEnd.toISOString()]
    );

    return NextResponse.json({ ok: true, plan: row.plan, interval: row.billing_interval });
  } catch (err) {

    return NextResponse.json({ error: 'Could not verify payment' }, { status: 500 });
  }
}