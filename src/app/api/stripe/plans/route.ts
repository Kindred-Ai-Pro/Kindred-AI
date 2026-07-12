export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  PLAN_IDS,
  PLAN_LABELS,
  createUnavailablePlans,
  getPriceIdForPlan,
} from '@/lib/plans';
import { getStripe } from '@/lib/stripe';

export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('--- STRIPE PLANS ERROR --- STRIPE_SECRET_KEY is not set');

    return NextResponse.json({
      plans: createUnavailablePlans(),
      configured: false,
    });
  }

  try {
    const plans = await Promise.all(
      PLAN_IDS.map(async (planId) => {
        const priceId = getPriceIdForPlan(planId);
        const label = PLAN_LABELS[planId];

        if (!priceId) {
          console.error(`Missing Stripe price env for plan: ${planId}`);
          return {
            id: planId,
            ...label,
            priceId: null,
            amount: null,
            currency: null,
            interval: null,
            available: false,
          };
        }

        try {
          const price = await getStripe().prices.retrieve(priceId);

          return {
            id: planId,
            ...label,
            priceId,
            amount: price.unit_amount,
            currency: price.currency,
            interval:
              planId === 'lifetime'
                ? 'once'
                : (price.recurring?.interval ?? null),
            available: true,
          };
        } catch (priceError) {
          console.error(`--- STRIPE PRICE ERROR (${planId}) ---`, priceError);
          return {
            id: planId,
            ...label,
            priceId,
            amount: null,
            currency: null,
            interval: null,
            available: false,
          };
        }
      }),
    );

    return NextResponse.json({ plans, configured: true });
  } catch (error) {
    console.error('--- STRIPE PLANS ERROR ---', error);

    return NextResponse.json({
      plans: createUnavailablePlans(),
      configured: false,
      error: 'Unable to load live pricing from Stripe.',
    });
  }
}
