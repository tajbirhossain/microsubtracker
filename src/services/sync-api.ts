import { ApiError } from '@/services/api/client';
import {
  cancelSubscription,
  createSubscription,
  updateSubscription,
} from '@/services/api/subscriptions';
import { categoryToSlug, toCreateBody } from '@/services/mappers/subscription';
import type { SyncFlushResult, SyncMutation } from '@/types/sync';
import type { BillingCycle, Subscription } from '@/constants/dashboard';

export class OfflineError extends Error {
  constructor(message = 'Device is offline') {
    super(message);
    this.name = 'OfflineError';
  }
}

async function flushOne(mutation: SyncMutation): Promise<boolean> {
  const payload = mutation.payload ?? {};

  try {
    if (mutation.type === 'create') {
      const body = toCreateBody({
        name: payload.name ?? 'Subscription',
        amount: payload.amount ?? 0,
        currency: payload.currency,
        billingCycle: (payload.billingCycle as BillingCycle) ?? 'monthly',
        category: payload.category ?? 'Entertainment',
        color: payload.color ?? '#5B9EFF',
        icon: payload.icon ?? 'S',
        providerKey: payload.providerKey,
        isTrial: payload.isTrial,
        trialEndsInDays: payload.trialEndsInDays,
        nextBillingDate: payload.nextBillingDate,
        scale: payload.scale,
      });
      await createSubscription(body, mutation.id);
      return true;
    }

    if (mutation.type === 'update') {
      const version = payload.version;
      if (typeof version !== 'number') return false;

      await updateSubscription(mutation.subscriptionId, {
        version,
        ...(payload.name != null ? { name: payload.name } : {}),
        ...(payload.amount != null ? { amount: payload.amount } : {}),
        ...(payload.currency != null ? { currency: payload.currency } : {}),
        ...(payload.billingCycle != null ? { billingCycle: payload.billingCycle } : {}),
        ...(payload.category != null
          ? { categorySlug: categoryToSlug(payload.category) ?? null }
          : {}),
        ...(payload.nextBillingDate != null ? { nextBillingDate: payload.nextBillingDate } : {}),
        ...(payload.isTrial != null ? { isTrial: payload.isTrial } : {}),
        ...(payload.color != null ? { color: payload.color } : {}),
        ...(payload.icon != null ? { icon: payload.icon } : {}),
        ...(payload.providerKey != null ? { providerKey: payload.providerKey } : {}),
        ...(payload.scale != null ? { scale: payload.scale } : {}),
      });
      return true;
    }

    if (mutation.type === 'cancel') {
      const version = payload.version;
      if (typeof version !== 'number') return false;
      await cancelSubscription(mutation.subscriptionId, version);
      return true;
    }

    if (mutation.type === 'keep') {
      const version = payload.version;
      if (typeof version !== 'number') return true;
      await updateSubscription(mutation.subscriptionId, {
        version,
        isTrial: false,
        trialEndsAt: null,
      });
      return true;
    }

    return false;
  } catch (error) {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      // Drop permanently rejected mutations so the queue doesn't stall.
      console.warn('Dropping failed sync mutation', mutation.id, error.message);
      return true;
    }
    throw error;
  }
}

export async function flushMutations(
  mutations: SyncMutation[],
  isOnline: boolean
): Promise<SyncFlushResult> {
  if (!isOnline) {
    throw new OfflineError();
  }

  if (mutations.length === 0) {
    return { ackedIds: [], syncedAt: new Date().toISOString() };
  }

  const ackedIds: string[] = [];

  for (const mutation of mutations) {
    const ok = await flushOne(mutation);
    if (ok) ackedIds.push(mutation.id);
  }

  return { ackedIds, syncedAt: new Date().toISOString() };
}

export type { Subscription };
