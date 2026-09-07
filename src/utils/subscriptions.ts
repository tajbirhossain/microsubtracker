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

export function sumMonthly(subs: Subscription[]): number {
  return subs.reduce((total, sub) => total + toMonthlyAmount(sub.amount, sub.billingCycle), 0);
}

export function sumYearly(subs: Subscription[]): number {
  return subs.reduce((total, sub) => total + toYearlyAmount(sub.amount, sub.billingCycle), 0);
}

export function parseDateKey(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatShortDate(iso: string): string {
  return parseDateKey(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeekday(iso: string): string {
  return parseDateKey(iso).toLocaleDateString('en-US', { weekday: 'short' });
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
