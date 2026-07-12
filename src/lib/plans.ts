import 'server-only';

import {
  PLAN_IDS,
  PLAN_LABELS,
  createUnavailablePlans,
  type PlanSummary,
} from '@/lib/plan-catalog';
import type { PlanId } from '@/lib/types/plans';

export type { PlanId } from '@/lib/types/plans';
export { PLAN_IDS, PLAN_LABELS, createUnavailablePlans, type PlanSummary };

const PLAN_ENV_KEYS: Record<PlanId, string> = {
  weekly: 'STRIPE_WEEKLY_PRICE_ID',
  monthly: 'STRIPE_MONTHLY_PRICE_ID',
  lifetime: 'STRIPE_LIFETIME_PRICE_ID',
};

const PLAN_ENV_FALLBACKS: Partial<Record<PlanId, string[]>> = {
  monthly: ['STRIPE_PRICE_ID'],
};

export function getPriceIdForPlan(plan: PlanId): string | undefined {
  const keys = [PLAN_ENV_KEYS[plan], ...(PLAN_ENV_FALLBACKS[plan] ?? [])];

  for (const key of keys) {
    const priceId = process.env[key];
    if (priceId && priceId !== 'price_') {
      return priceId;
    }
  }

  return undefined;
}

export function isValidPlan(plan: string): plan is PlanId {
  return PLAN_IDS.includes(plan as PlanId);
}
