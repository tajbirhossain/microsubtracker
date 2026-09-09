export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'INR'
  | 'BDT'
  | 'JPY'
  | 'SGD'
  | 'AED';

export type CurrencyOption = {
  code: CurrencyCode;
  name: string;
  symbol: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
];

const RATES_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  INR: 83.2,
  BDT: 109.5,
  JPY: 149.8,
  SGD: 1.34,
  AED: 3.67,
};

export const CACHED_RATES_UPDATED_AT = '2026-09-05T18:00:00.000Z';

export function isCurrencyCode(code: string): code is CurrencyCode {
  return CURRENCIES.some((c) => c.code === code);
}

export function getCurrency(code: string): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function convertUsd(amountUsd: number, code: CurrencyCode): number {
  return amountUsd * (RATES_FROM_USD[code] ?? 1);
}

export function getRateFromUsd(code: CurrencyCode): number {
  return RATES_FROM_USD[code] ?? 1;
}

export function formatCachedRateLabel(updatedAt = CACHED_RATES_UPDATED_AT): string {
  const date = new Date(updatedAt);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
