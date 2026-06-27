// app/api/billing/flutterwave/init/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

// Flutterwave Payment Plan IDs (test mode) per plan + interval.
const PLAN_IDS = {
  premium: { monthly: 238097, yearly: 238128 },
  family:  { monthly: 238099, yearly: 238126},
};
// USD prices for display/validation per plan + interval.
const PLAN_PRICES = {
  premium: { monthly: 4.99, yearly: 59.88 },
  family:  { monthly: 14.99, yearly: 179.88 },
};

export async function POST(req) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { plan, interval = 'monthly' } = await req.json();
    const cycle = interval === 'yearly' ? 'yearly' : 'monthly';

    if (!PLAN_IDS[plan] || !PLAN_IDS[plan][cycle]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await queryOne('SELECT id, email, name FROM users WHERE id = $1', [session.id]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const tx_ref = `My Family and I-${user.id}-${plan}-${cycle}-${randomBytes(6).toString('hex')}`;
    const amount = PLAN_PRICES[plan][cycle];

    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref,
        amount,
        currency: 'USD',
        payment_plan: PLAN_IDS[plan][cycle],   // ← makes it a recurring subscription
        redirect_url: `${appUrl}/checkout?plan=${plan}&interval=${cycle}`,
        customer: { email: user.email, name: user.name || user.email },
        meta: { user_id: user.id, plan, interval: cycle },
        customizations: {
          title: 'My Family and I',
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} (${cycle}) subscription`,
        },
      }),
    });

    const data = await res.json();
    if (data.status !== 'success' || !data.data?.link) {
      return NextResponse.json({ error: data.message || 'Could not start payment' }, { status: 400 });
    }

    return NextResponse.json({ link: data.data.link });
} catch {
  return NextResponse.json({ error: 'Could not start payment' }, { status: 500 });
}
}