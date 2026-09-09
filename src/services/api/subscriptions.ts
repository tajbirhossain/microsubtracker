import { apiRequest } from '@/services/api/client';
import type {
  ApiSubscription,
  CreateSubscriptionBody,
  PaginatedResult,
  UpdateSubscriptionBody,
} from '@/types/api';

function newIdempotencyKey() {
  return `idem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function listSubscriptions(params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'cancelled' | 'paused';
  billingCycle?: 'weekly' | 'monthly' | 'yearly';
  categorySlug?: string;
  search?: string;
}): Promise<PaginatedResult<ApiSubscription>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit ?? 100));
  else query.set('limit', '100');
  if (params?.status) query.set('status', params.status);
  if (params?.billingCycle) query.set('billingCycle', params.billingCycle);
  if (params?.categorySlug) query.set('categorySlug', params.categorySlug);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return apiRequest(`/subscriptions${qs ? `?${qs}` : ''}`, { auth: true });
}

export async function getSubscription(id: string): Promise<ApiSubscription> {
  const data = await apiRequest<{ subscription: ApiSubscription }>(`/subscriptions/${id}`, {
    auth: true,
  });
  return data.subscription;
}

export async function createSubscription(
  body: CreateSubscriptionBody,
  idempotencyKey = newIdempotencyKey()
): Promise<ApiSubscription> {
  const data = await apiRequest<{ subscription: ApiSubscription }>('/subscriptions', {
    method: 'POST',
    auth: true,
    body,
    idempotencyKey,
  });
  return data.subscription;
}

export async function updateSubscription(
  id: string,
  body: UpdateSubscriptionBody
): Promise<ApiSubscription> {
  const data = await apiRequest<{ subscription: ApiSubscription }>(`/subscriptions/${id}`, {
    method: 'PATCH',
    auth: true,
    body,
  });
  return data.subscription;
}

export async function cancelSubscription(
  id: string,
  version: number,
  cancellationNotes?: string
): Promise<ApiSubscription> {
  const data = await apiRequest<{ subscription: ApiSubscription }>(`/subscriptions/${id}`, {
    method: 'DELETE',
    auth: true,
    body: { version, ...(cancellationNotes ? { cancellationNotes } : {}) },
    idempotencyKey: newIdempotencyKey(),
  });
  return data.subscription;
}

export async function fetchBurnRate() {
  return apiRequest<{
    currency: string;
    monthlyTotal: number;
    yearlyTotal: number;
    activeCount: number;
    byCategory: { slug: string; name: string; monthlyTotal: number }[];
    byScale: { micro: number; macro: number };
    unused: { count: number; quietMonthlyTotal: number };
    trials: { count: number };
    upcoming: { count: number; monthlyTotal: number };
  }>('/subscriptions/burn-rate', { auth: true });
}

export async function fetchUpcoming(days = 30) {
  return apiRequest<{
    days: number;
    count: number;
    monthlyTotal: number;
    currency: string;
    items: (ApiSubscription & { daysUntil: number })[];
  }>(`/subscriptions/upcoming?days=${days}`, { auth: true });
}

export async function fetchCalendar(year: number, month: number) {
  return apiRequest<{
    year: number;
    month: number;
    renewalCount: number;
    trialEndCount: number;
    days: {
      date: string;
      renewals: ApiSubscription[];
      trialEnds: ApiSubscription[];
    }[];
  }>(`/subscriptions/calendar?year=${year}&month=${month}`, { auth: true });
}

export async function fetchUnused(minDays = 30) {
  return apiRequest<{
    minDays: number;
    count: number;
    quietMonthlyTotal: number;
    currency: string;
    items: (ApiSubscription & { unusedDays: number; quietMonthly: number })[];
  }>(`/subscriptions/unused?minDays=${minDays}`, { auth: true });
}

export async function fetchExpiringTrials(days = 14) {
  return apiRequest<{
    days: number;
    count: number;
    items: (ApiSubscription & { daysLeft: number })[];
  }>(`/subscriptions/expiring-trials?days=${days}`, { auth: true });
}
