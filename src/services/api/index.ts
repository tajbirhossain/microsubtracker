import { apiRequest } from '@/services/api/client';
import type { CurrencyRatesResult, NotificationPreferences, ParserEventView } from '@/types/api';

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const data = await apiRequest<{ preferences: NotificationPreferences }>(
    '/notifications/preferences',
    { auth: true }
  );
  return data.preferences;
}

export async function updateNotificationPreferences(
  patch: Partial<
    Pick<
      NotificationPreferences,
      | 'renewalsEnabled'
      | 'trialsEnabled'
      | 'unusedEnabled'
      | 'weeklySummaryEnabled'
      | 'upcomingWeekEnabled'
      | 'quietHoursStart'
      | 'quietHoursEnd'
      | 'timezone'
    >
  >
): Promise<NotificationPreferences> {
  const data = await apiRequest<{ preferences: NotificationPreferences }>(
    '/notifications/preferences',
    { method: 'PATCH', auth: true, body: patch }
  );
  return data.preferences;
}

export async function registerPushToken(deviceKey: string, pushToken: string | null) {
  return apiRequest<{ deviceKey: string; pushTokenRegistered: boolean }>(
    '/notifications/push-token',
    {
      method: 'PUT',
      auth: true,
      body: { deviceKey, pushToken },
    }
  );
}

export async function getCurrencyRates(base = 'USD'): Promise<CurrencyRatesResult> {
  return apiRequest(`/currency/rates?base=${encodeURIComponent(base)}`, { auth: true });
}

export async function convertCurrency(amount: number, from: string, to: string) {
  const query = new URLSearchParams({
    amount: String(amount),
    from,
    to,
  });
  return apiRequest<{
    amount: number;
    from: string;
    to: string;
    result: number;
    rate: number;
    base: string;
    source: string;
    fetchedAt: string;
    stale: boolean;
    fallback: boolean;
  }>(`/currency/convert?${query}`, { auth: true });
}

export async function getSupportedCurrencies() {
  return apiRequest<{ currencies: string[] }>('/currency/supported', { auth: true });
}

export async function ingestParserEvent(body: {
  sourceType: 'sms' | 'notification' | 'paste' | 'receipt_image';
  rawPayload?: string;
  imageBase64?: string;
  imageMimeType?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  sender?: string;
  packageName?: string;
  receivedAt?: string;
  deviceKey?: string;
}) {
  return apiRequest<{
    events: ParserEventView[];
    event: ParserEventView;
    needsManualEntry: boolean;
    engine: 'gemini' | 'regex';
  }>('/parser/ingest', {
    method: 'POST',
    auth: true,
    body,
  });
}

export async function listParserCandidates(status = 'classified', limit = 50) {
  return apiRequest<{ items: ParserEventView[] }>(
    `/parser/candidates?status=${encodeURIComponent(status)}&limit=${limit}`,
    { auth: true }
  );
}

export async function confirmParserEvent(
  id: string,
  overrides?: {
    name?: string;
    amount?: number;
    currency?: string;
    billingCycle?: 'weekly' | 'monthly' | 'yearly';
    categorySlug?: string;
    nextBillingDate?: string;
  }
) {
  return apiRequest<{ event: ParserEventView; subscription: unknown }>(`/parser/${id}/confirm`, {
    method: 'POST',
    auth: true,
    body: overrides ?? {},
  });
}

export async function rejectParserEvent(id: string) {
  return apiRequest<{ event: ParserEventView }>(`/parser/${id}/reject`, {
    method: 'POST',
    auth: true,
  });
}

export async function trackAnalyticsEvent(body: {
  sessionId: string;
  anonymousId?: string;
  deviceKey?: string;
  funnel: 'onboarding' | 'paywall';
  step: string;
  action: 'viewed' | 'completed' | 'skipped' | 'purchase_started' | 'purchase_completed' | 'dismissed';
  properties?: Record<string, unknown>;
}) {
  return apiRequest('/analytics/events', {
    method: 'POST',
    auth: true,
    body,
  }).catch(() => null);
}
