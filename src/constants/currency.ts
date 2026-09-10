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

/** Offline / first-boot fallback only — live rates come from the API. */
export const FALLBACK_RATES_FROM_USD: Record<CurrencyCode, number> = {
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

export type RatesMap = Partial<Record<CurrencyCode, number>> & Record<string, number>;

export function isCurrencyCode(code: string): code is CurrencyCode {
  return CURRENCIES.some((c) => c.code === code);
}

export function getCurrency(code: string): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function getRateFromUsd(
  code: CurrencyCode,
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  if (code === 'USD') return 1;
  const rate = rates[code];
  return typeof rate === 'number' && Number.isFinite(rate) && rate > 0
    ? rate
    : (FALLBACK_RATES_FROM_USD[code] ?? 1);
}

export function convertUsd(
  amountUsd: number,
  code: CurrencyCode,
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  return amountUsd * getRateFromUsd(code, rates);
}

/** Convert an amount from its billing currency into USD using rates (USD→X). */
export function convertToUsd(
  amount: number,
  fromCurrency: string,
  rates: RatesMap = FALLBACK_RATES_FROM_USD
): number {
  const code = isCurrencyCode(fromCurrency) ? fromCurrency : 'USD';
  if (code === 'USD') return amount;
  const rate = getRateFromUsd(code, rates);
  return rate > 0 ? amount / rate : amount;
}

export function formatCachedRateLabel(updatedAt?: string | null): string {
  if (!updatedAt) return 'earlier';
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return 'earlier';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function normalizeRatesMap(rates: Record<string, number>): RatesMap {
  const next: RatesMap = { USD: 1 };
  for (const [code, rate] of Object.entries(rates)) {
    const upper = code.toUpperCase();
    if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
      next[upper] = rate;
    }
  }
  return next;
}
