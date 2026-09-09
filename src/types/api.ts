export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  requestId?: string;
  details?: unknown;
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  preferredCurrency: string;
  createdAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  tokenType: 'Bearer';
};

export type AuthSessionResult = {
  user: AuthUser;
  tokens: AuthTokens;
  deviceId: string;
};

export type OtpPurpose = 'registration' | 'new_device' | 'password_reset';

export type OtpSentResult = {
  requiresOtp: true;
  purpose: OtpPurpose;
  expiresAt: string;
  otp?: string;
};

export type DevicePayload = {
  deviceKey: string;
  platform: 'android' | 'ios' | 'web';
  pushToken?: string;
  appVersion?: string;
};

export type SubscriptionCategoryView = {
  id: string;
  slug: string;
  name: string;
};

export type ApiSubscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  category: SubscriptionCategoryView | null;
  scale: 'micro' | 'macro';
  status: 'active' | 'cancelled' | 'paused';
  nextBillingDate: string | null;
  isTrial: boolean;
  trialEndsAt: string | null;
  lastUsedAt: string | null;
  unusedDays: number | null;
  providerKey: string | null;
  color: string | null;
  icon: string | null;
  cancelledAt: string | null;
  cancellationNotes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type CreateSubscriptionBody = {
  name: string;
  amount: number;
  currency?: string;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  categorySlug?: string;
  scale?: 'micro' | 'macro';
  status?: 'active' | 'cancelled' | 'paused';
  nextBillingDate?: string;
  isTrial?: boolean;
  trialEndsAt?: string;
  providerKey?: string;
  color?: string;
  icon?: string;
  cancellationNotes?: string;
};

export type UpdateSubscriptionBody = {
  version: number;
  name?: string;
  amount?: number;
  currency?: string;
  billingCycle?: 'weekly' | 'monthly' | 'yearly';
  categoryId?: string | null;
  categorySlug?: string | null;
  scale?: 'micro' | 'macro';
  status?: 'active' | 'cancelled' | 'paused';
  nextBillingDate?: string | null;
  isTrial?: boolean;
  trialEndsAt?: string | null;
  providerKey?: string | null;
  color?: string | null;
  icon?: string | null;
  cancellationNotes?: string | null;
};

export type NotificationPreferences = {
  renewalsEnabled: boolean;
  trialsEnabled: boolean;
  unusedEnabled: boolean;
  weeklySummaryEnabled: boolean;
  upcomingWeekEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  timezone: string;
  updatedAt: string;
};

export type CurrencyRatesResult = {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
  source: string;
  stale: boolean;
  fallback: boolean;
};

export type ParserEventView = {
  id: string;
  sourceType: 'sms' | 'notification';
  rawPayload: string;
  merchant: string | null;
  amount: number | null;
  currency: string | null;
  confidence: number | null;
  status: 'pending' | 'classified' | 'confirmed' | 'rejected' | 'failed';
  needsManualEntry: boolean;
  subscriptionId: string | null;
  normalizedPayload: unknown;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};
