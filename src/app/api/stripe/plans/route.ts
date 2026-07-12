export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  PLAN_IDS,
  PLAN_LABELS,
  createUnavailablePlans,
  getMissingStripeEnvVars,
  getPriceIdForPlan,
} from '@/lib/plans';
import {
  describeStripeKeyProblem,
  getStripeKeyMode,
  readStripeEnv,
} from '@/lib/stripe-env';
import { getStripe } from '@/lib/stripe';

function stripeConfigResponse(
  plans: ReturnType<typeof createUnavailablePlans>,
  extra: Record<string, unknown> = {},
  status = 200,
) {
  const missingEnvVars = getMissingStripeEnvVars();

  return NextResponse.json(
    {
      plans,
      configured: missingEnvVars.length === 0,
      missingEnvVars,
      ...extra,
    },
    { status },
  );
}

export async function GET() {
  const missingEnvVars = getMissingStripeEnvVars();

  if (missingEnvVars.length > 0) {
    console.error(
      '--- STRIPE PLANS ERROR --- missing env vars:',
      missingEnvVars.join(', '),
    );

    return stripeConfigResponse(
      createUnavailablePlans(),
      {
        error: 'Stripe not configured',
      },
      404,
    );
  }

  const secretKey = readStripeEnv('STRIPE_SECRET_KEY');
  const stripeMode = getStripeKeyMode(secretKey);
  const keyProblem = describeStripeKeyProblem(secretKey);

  if (keyProblem) {
    console.error('--- STRIPE PLANS ERROR ---', keyProblem);

    return stripeConfigResponse(
      createUnavailablePlans(),
      {
        error: keyProblem,
        stripeMode,
      },
      404,
    );
  }

  try {
    const priceErrors: Record<string, { priceId: string; message: string }> =
      {};

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
            livemode: price.livemode,
          };
        } catch (priceError) {
          const stripeMessage =
            priceError instanceof Error ? priceError.message : String(priceError);

          console.error(`--- STRIPE PRICE ERROR (${planId}) ---`, stripeMessage);
          priceErrors[planId] = { priceId, message: stripeMessage };

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

    const configuredPriceIds = Object.fromEntries(
      PLAN_IDS.map((planId) => [planId, getPriceIdForPlan(planId) ?? null]),
    );

    const firstPriceError = Object.values(priceErrors)[0];
    const hasModeMismatch = Object.values(priceErrors).some(({ message }) =>
      message.includes('a similar object exists in test mode') ||
      message.includes('a similar object exists in live mode'),
    );
    const hasStalePriceId = Object.values(priceErrors).some(({ message }) =>
      message.includes('No such price'),
    );

    let hint: string | undefined;

    if (hasModeMismatch) {
      hint =
        stripeMode === 'live'
          ? 'Test-mode price IDs are saved in Vercel but STRIPE_SECRET_KEY is live. Either use sk_test_ for testing, or create new prices in Stripe Live mode and paste those IDs into Vercel.'
          : 'Live-mode price IDs are saved in Vercel but STRIPE_SECRET_KEY is test. Use matching test price IDs or switch to sk_live_.';
    } else if (hasStalePriceId) {
      hint =
        'Stripe says “No such price” for the IDs in Vercel. After deleting/recreating products, copy the new price_ IDs from Stripe and update all three STRIPE_*_PRICE_ID variables, then redeploy.';
    } else if (firstPriceError) {
      hint = firstPriceError.message;
    }

    return NextResponse.json({
      plans,
      configured: plans.some((plan) => plan.available),
      missingEnvVars: [],
      stripeMode,
      configuredPriceIds,
      priceErrors,
      hint,
      error: plans.some((plan) => plan.available) ? undefined : 'Stripe could not load prices',
    });
  } catch (error) {
    console.error('--- STRIPE PLANS ERROR ---', error);

    const message = error instanceof Error ? error.message : String(error);

    return stripeConfigResponse(createUnavailablePlans(), {
      error: message || 'Unable to load pricing from Stripe.',
      stripeMode,
    });
  }
}
