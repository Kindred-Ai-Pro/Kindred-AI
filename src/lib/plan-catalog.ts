import type { PlanId } from '@/lib/types/plans';

export const PLAN_IDS: PlanId[] = ['weekly', 'monthly', 'lifetime'];

export const PLAN_LABELS: Record<
  PlanId,
  { name: string; description: string; highlight?: boolean }
> = {
  weekly: {
    name: 'Weekly',
    description: 'Flexible access, billed every week.',
  },
  monthly: {
    name: 'Monthly',
    description: 'Our most popular plan for regular reflection.',
    highlight: true,
  },
  lifetime: {
    name: 'Lifetime',
    description: 'Pay once, journal forever.',
  },
};

export type PlanSummary = {
  id: PlanId;
  name: string;
  description: string;
  highlight?: boolean;
  priceId: string | null;
  amount: number | null;
  currency: string | null;
  interval: string | null;
  available: boolean;
};

export function createUnavailablePlans(): PlanSummary[] {
  return PLAN_IDS.map((planId) => ({
    id: planId,
    ...PLAN_LABELS[planId],
    priceId: null,
    amount: null,
    currency: null,
    interval: null,
    available: false,
  }));
}
