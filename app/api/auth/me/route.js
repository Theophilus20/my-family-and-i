// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { queryOne } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  let user = await queryOne(
    `SELECT id, name, email, plan, bio, birthdate, avatar_url, email_verified,
            billing_interval, subscription_status, current_period_end, scheduled_plan
       FROM users WHERE id = $1`,
    [session.id]
  );

  if (!user) return NextResponse.json({ user: null });

  // --- Lazy period-end check ---
  // If the paid period has ended, apply any pending cancellation or scheduled downgrade.
  // (A webhook will do this promptly in production; this is the local/safety-net fallback.)
 const end = user.current_period_end ? new Date(user.current_period_end) : null;
const periodOver = end && end.getTime() <= Date.now();

if (periodOver && user.plan !== 'free') {
  if (user.subscription_status === 'cancelling') {
    // Cancellation: lapse to Free.
      user = await queryOne(
        `UPDATE users
            SET plan = 'free',
                subscription_status = 'active',
                current_period_end = NULL,
                scheduled_plan = NULL
          WHERE id = $1
          RETURNING id, name, email, plan, bio, birthdate, avatar_url, email_verified,
                    billing_interval, subscription_status, current_period_end, scheduled_plan`,
        [session.id]
      );
    } else if (user.scheduled_plan && user.scheduled_plan !== user.plan) {
      // Scheduled downgrade: switch to the lower plan and start a fresh period.
      const newEnd = new Date();
      if (user.billing_interval === 'yearly') newEnd.setFullYear(newEnd.getFullYear() + 1);
      else newEnd.setMonth(newEnd.getMonth() + 1);

      user = await queryOne(
        `UPDATE users
            SET plan = $2,
                scheduled_plan = NULL,
                subscription_status = 'active',
                current_period_end = $3
          WHERE id = $1
          RETURNING id, name, email, plan, bio, birthdate, avatar_url, email_verified,
                    billing_interval, subscription_status, current_period_end, scheduled_plan`,
        [session.id, user.scheduled_plan, newEnd.toISOString()]
      );
    }
  }

  return NextResponse.json({ user });
}