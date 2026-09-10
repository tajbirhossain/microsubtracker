import {
  convertToUsd,
  FALLBACK_RATES_FROM_USD,
  type RatesMap,
} from '@/constants/currency';
import type { BillingCycle, Subscription } from '@/constants/dashboard';

export function toMonthlyAmount(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return (amount * 52) / 12;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
}

export function toYearlyAmount(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return amount * 52;
    case 'monthly':
      return amount * 12;
    default:
      return amount;
  }
}

export function amountInUsd(
  amount: number,
  currency: string,
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  return convertToUsd(amount, currency, rates);
}

export function subscriptionAmountUsd(
  sub: Pick<Subscription, 'amount' | 'currency'>,
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  return amountInUsd(sub.amount, sub.currency, rates);
}

export function toMonthlyUsd(
  sub: Pick<Subscription, 'amount' | 'currency' | 'billingCycle'>,
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  return toMonthlyAmount(subscriptionAmountUsd(sub, rates), sub.billingCycle);
}

export function toYearlyUsd(
  sub: Pick<Subscription, 'amount' | 'currency' | 'billingCycle'>,
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  return toYearlyAmount(subscriptionAmountUsd(sub, rates), sub.billingCycle);
}

export function formatMoney(amount: number, currency = 'USD', compact = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(amount);
}

export function cycleLabel(cycle: BillingCycle): string {
  switch (cycle) {
    case 'weekly':
      return '/wk';
    case 'yearly':
      return '/yr';
    default:
      return '/mo';
  }
}

/** Sums in USD so mixed-currency subscriptions can feed burn-rate display. */
export function sumMonthly(
  subs: Subscription[],
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  return subs.reduce((total, sub) => total + toMonthlyUsd(sub, rates), 0);
}

export function sumYearly(
  subs: Subscription[],
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  return subs.reduce((total, sub) => total + toYearlyUsd(sub, rates), 0);
}

export function parseDateKey(iso: string): Date {
  const key = normalizeDateKey(iso);
  if (!key) return new Date(NaN);
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Accepts YYYY-MM-DD or full ISO datetimes from the API. */
export function normalizeDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match?.[1] ?? null;
}

export function formatShortDate(iso: string): string {
  const date = parseDateKey(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeekday(iso: string): string {
  const date = parseDateKey(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function daysUntil(iso: string, from = new Date()): number {
  const target = parseDateKey(iso);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function monthMatrix(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = first.getDay();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Advance one billing period from a local calendar date. */
export function addOneBillingCycle(from: Date, cycle: BillingCycle): Date {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  switch (cycle) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'monthly':
    default: {
      const day = date.getDate();
      date.setMonth(date.getMonth() + 1, 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      date.setDate(Math.min(day, lastDay));
      break;
    }
  }
  return date;
}

/** Next renewal from today (or `from`) based on billing cycle — not a fixed +28 days. */
export function defaultNextBillingDate(cycle: BillingCycle, from = new Date()): string {
  return toDateKey(addOneBillingCycle(from, cycle));
}

/**
 * Derive next_billing_date from a subscription start date.
 * Future start → first charge on that day. Today/past → roll forward by cycle until after today.
 * Uses existing next_billing_date field only — no new schema column.
 */
export function nextBillingFromStart(
  cycle: BillingCycle,
  startDateKey: string,
  today = new Date()
): string {
  const start = parseDateKey(startDateKey);
  if (Number.isNaN(start.getTime())) {
    return defaultNextBillingDate(cycle, today);
  }

  const todayKey = toDateKey(today);
  const startKey = toDateKey(start);
  if (startKey > todayKey) {
    return startKey;
  }

  let next = addOneBillingCycle(start, cycle);
  let guard = 0;
  while (toDateKey(next) <= todayKey && guard < 600) {
    next = addOneBillingCycle(next, cycle);
    guard += 1;
  }
  return toDateKey(next);
}

export function groupByBillingDate(subs: Subscription[]): { date: string; items: Subscription[] }[] {
  const map = new Map<string, Subscription[]>();
  for (const sub of subs) {
    const list = map.get(sub.nextBillingDate) ?? [];
    list.push(sub);
    map.set(sub.nextBillingDate, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({ date, items }));
}
