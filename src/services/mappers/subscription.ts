import type { BillingCycle, Subscription } from '@/constants/dashboard';
import { daysUntil, defaultNextBillingDate, normalizeDateKey, toDateKey } from '@/utils/subscriptions';
import type { ApiSubscription, CreateSubscriptionBody } from '@/types/api';

const CATEGORY_TO_SLUG: Record<string, string> = {
  Entertainment: 'entertainment',
  Productivity: 'productivity',
  Cloud: 'cloud',
  Health: 'health',
  News: 'news',
  Shopping: 'shopping',
};

export function categoryToSlug(category: string): string | undefined {
  if (!category || category === 'All') return undefined;
  return CATEGORY_TO_SLUG[category] ?? category.toLowerCase().replace(/\s+/g, '-');
}

export function mapApiSubscription(api: ApiSubscription): Subscription & { version: number } {
  const nextBillingDate =
    normalizeDateKey(api.nextBillingDate) ?? new Date().toISOString().slice(0, 10);
  const trialEndsAt = normalizeDateKey(api.trialEndsAt);
  const trialEndsInDays =
    api.isTrial && trialEndsAt ? Math.max(0, daysUntil(trialEndsAt)) : undefined;

  return {
    id: api.id,
    name: api.name,
    amount: api.amount,
    currency: api.currency,
    billingCycle: api.billingCycle,
    category: api.category?.name ?? 'Other',
    scale: api.scale,
    nextBillingDate,
    color: api.color ?? '#5B9EFF',
    icon: api.icon ?? api.name.slice(0, 1).toUpperCase(),
    providerKey: api.providerKey ?? undefined,
    status: api.status === 'paused' ? 'active' : api.status,
    isTrial: api.isTrial,
    trialEndsInDays,
    unusedDays: api.unusedDays ?? undefined,
    version: api.version,
  };
}

export function toCreateBody(input: {
  name: string;
  amount: number;
  currency?: string;
  billingCycle: BillingCycle;
  category: string;
  color: string;
  icon: string;
  providerKey?: string;
  isTrial?: boolean;
  trialEndsInDays?: number;
  nextBillingDate?: string;
  scale?: 'micro' | 'macro';
}): CreateSubscriptionBody {
  const trialEndsAt =
    input.isTrial && input.trialEndsInDays != null
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + input.trialEndsInDays);
          return toDateKey(d);
        })()
      : undefined;

  return {
    name: input.name,
    amount: input.amount,
    currency: input.currency ?? 'USD',
    billingCycle: input.billingCycle,
    categorySlug: categoryToSlug(input.category),
    scale: input.scale,
    nextBillingDate:
      input.nextBillingDate ?? trialEndsAt ?? defaultNextBillingDate(input.billingCycle),
    isTrial: Boolean(input.isTrial),
    ...(input.isTrial && trialEndsAt ? { trialEndsAt } : {}),
    providerKey: input.providerKey,
    color: input.color,
    icon: input.icon,
  };
}
