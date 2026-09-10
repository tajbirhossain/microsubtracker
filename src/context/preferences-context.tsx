import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  convertToUsd,
  convertUsd,
  FALLBACK_RATES_FROM_USD,
  getCurrency,
  getRateFromUsd,
  normalizeRatesMap,
  type CurrencyCode,
  type RatesMap,
  isCurrencyCode,
} from '@/constants/currency';
import {
  DEFAULT_NOTIFICATION_CONTENT_IDS,
  type NotificationContentId,
} from '@/constants/notification-content';
import { useNetwork } from '@/context/network-context';
import { useOnboarding } from '@/context/onboarding-context';
import {
  getCurrencyRates,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/api';
import { loadCurrencyRates, saveCurrencyRates } from '@/services/local-store';
import { formatMoney } from '@/utils/subscriptions';

export type RatesStatus = 'live' | 'cached';
export type NotificationPermissionStatus = 'unknown' | 'granted' | 'denied';

type PreferencesContextValue = {
  currencyCode: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  rates: RatesMap;
  ratesStatus: RatesStatus;
  ratesFetchedAt: string | null;
  ratesSource: string | null;
  getUsdRate: (code?: CurrencyCode) => number;
  refreshRates: () => Promise<void>;
  notificationPermission: NotificationPermissionStatus;
  setNotificationPermission: (status: NotificationPermissionStatus) => void;
  notificationContentIds: NotificationContentId[];
  toggleNotificationContent: (id: NotificationContentId) => void;
  setNotificationContentIds: (ids: NotificationContentId[]) => void;
  seedDefaultNotificationContent: () => void;
  dismissedGhostIds: string[];
  dismissGhost: (subscriptionId: string) => void;
  convertFromUsd: (amountUsd: number) => number;
  /** Format a USD amount into the active display currency. */
  formatInCurrency: (amountUsd: number, compact?: boolean) => string;
  /** Format a billed amount from its native currency into the display currency. */
  formatFromCurrency: (amount: number, fromCurrency: string, compact?: boolean) => string;
};

function prefsToContentIds(prefs: {
  renewalsEnabled: boolean;
  trialsEnabled: boolean;
  unusedEnabled: boolean;
  weeklySummaryEnabled: boolean;
  upcomingWeekEnabled: boolean;
}): NotificationContentId[] {
  const ids: NotificationContentId[] = [];
  if (prefs.renewalsEnabled) ids.push('renewals');
  if (prefs.trialsEnabled) ids.push('trials');
  if (prefs.unusedEnabled) ids.push('unused');
  if (prefs.weeklySummaryEnabled) ids.push('weekly-summary');
  if (prefs.upcomingWeekEnabled) ids.push('upcoming-week');
  return ids.length ? ids : DEFAULT_NOTIFICATION_CONTENT_IDS;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useNetwork();
  const { isAuthenticated, isAuthReady, user } = useOnboarding();
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<RatesMap>({ ...FALLBACK_RATES_FROM_USD });
  const [ratesStatus, setRatesStatus] = useState<RatesStatus>('cached');
  const [ratesFetchedAt, setRatesFetchedAt] = useState<string | null>(null);
  const [ratesSource, setRatesSource] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionStatus>('unknown');
  const [notificationContentIds, setNotificationContentIds] = useState<NotificationContentId[]>(
    DEFAULT_NOTIFICATION_CONTENT_IDS
  );
  const [dismissedGhostIds, setDismissedGhostIds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.preferredCurrency && isCurrencyCode(user.preferredCurrency)) {
      setCurrencyCode(user.preferredCurrency);
    }
  }, [user?.preferredCurrency]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await loadCurrencyRates();
      if (cancelled || !cached?.rates) return;
      setRates(normalizeRatesMap(cached.rates));
      setRatesFetchedAt(cached.fetchedAt);
      setRatesSource(cached.source);
      setRatesStatus(cached.stale || cached.fallback ? 'cached' : 'live');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyRatesBundle = useCallback(
    async (bundle: {
      rates: Record<string, number>;
      fetchedAt: string;
      source: string;
      stale: boolean;
      fallback: boolean;
    }) => {
      const normalized = normalizeRatesMap(bundle.rates);
      setRates(normalized);
      setRatesFetchedAt(bundle.fetchedAt);
      setRatesSource(bundle.source);
      setRatesStatus(bundle.stale || bundle.fallback ? 'cached' : 'live');
      await saveCurrencyRates({
        base: 'USD',
        rates: normalized,
        fetchedAt: bundle.fetchedAt,
        source: bundle.source,
        stale: bundle.stale,
        fallback: bundle.fallback,
      });
    },
    []
  );

  const refreshRates = useCallback(async () => {
    if (!isOnline || !isAuthenticated) {
      setRatesStatus('cached');
      return;
    }
    try {
      const bundle = await getCurrencyRates('USD');
      await applyRatesBundle(bundle);
    } catch {
      setRatesStatus('cached');
    }
  }, [applyRatesBundle, isAuthenticated, isOnline]);

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !isOnline) return;

    let cancelled = false;
    (async () => {
      try {
        const [prefs, bundle] = await Promise.all([
          getNotificationPreferences(),
          getCurrencyRates('USD'),
        ]);
        if (cancelled) return;
        setNotificationContentIds(prefsToContentIds(prefs));
        await applyRatesBundle(bundle);
      } catch {
        if (!cancelled) setRatesStatus('cached');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyRatesBundle, isAuthReady, isAuthenticated, isOnline]);

  useEffect(() => {
    if (!isOnline) {
      setRatesStatus('cached');
    }
  }, [isOnline]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyCode(code);
  }, []);

  const getUsdRate = useCallback(
    (code: CurrencyCode = currencyCode) => getRateFromUsd(code, rates),
    [currencyCode, rates]
  );

  const persistNotificationIds = useCallback(
    async (ids: NotificationContentId[]) => {
      if (!isAuthenticated || !isOnline) return;
      try {
        await updateNotificationPreferences({
          renewalsEnabled: ids.includes('renewals'),
          trialsEnabled: ids.includes('trials'),
          unusedEnabled: ids.includes('unused'),
          weeklySummaryEnabled: ids.includes('weekly-summary'),
          upcomingWeekEnabled: ids.includes('upcoming-week'),
        });
      } catch (error) {
        console.warn('Failed to sync notification preferences', error);
      }
    },
    [isAuthenticated, isOnline]
  );

  const toggleNotificationContent = useCallback(
    (id: NotificationContentId) => {
      setNotificationContentIds((prev) => {
        let next: NotificationContentId[];
        if (prev.includes(id)) {
          if (prev.length === 1) return prev;
          next = prev.filter((item) => item !== id);
        } else {
          next = [...prev, id];
        }
        void persistNotificationIds(next);
        return next;
      });
    },
    [persistNotificationIds]
  );

  const setNotificationContentIdsSafe = useCallback(
    (ids: NotificationContentId[]) => {
      setNotificationContentIds(ids);
      void persistNotificationIds(ids);
    },
    [persistNotificationIds]
  );

  const seedDefaultNotificationContent = useCallback(() => {
    setNotificationContentIdsSafe(DEFAULT_NOTIFICATION_CONTENT_IDS);
  }, [setNotificationContentIdsSafe]);

  const dismissGhost = useCallback((subscriptionId: string) => {
    setDismissedGhostIds((prev) =>
      prev.includes(subscriptionId) ? prev : [...prev, subscriptionId]
    );
  }, []);

  const convertFromUsd = useCallback(
    (amountUsd: number) => convertUsd(amountUsd, currencyCode, rates),
    [currencyCode, rates]
  );

  const formatInCurrency = useCallback(
    (amountUsd: number, compact = false) =>
      formatMoney(convertUsd(amountUsd, currencyCode, rates), currencyCode, compact),
    [currencyCode, rates]
  );

  const formatFromCurrency = useCallback(
    (amount: number, fromCurrency: string, compact = false) =>
      formatInCurrency(convertToUsd(amount, fromCurrency, rates), compact),
    [formatInCurrency, rates]
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      currencyCode,
      setCurrency,
      rates,
      ratesStatus,
      ratesFetchedAt,
      ratesSource,
      getUsdRate,
      refreshRates,
      notificationPermission,
      setNotificationPermission,
      notificationContentIds,
      toggleNotificationContent,
      setNotificationContentIds: setNotificationContentIdsSafe,
      seedDefaultNotificationContent,
      dismissedGhostIds,
      dismissGhost,
      convertFromUsd,
      formatInCurrency,
      formatFromCurrency,
    }),
    [
      currencyCode,
      setCurrency,
      rates,
      ratesStatus,
      ratesFetchedAt,
      ratesSource,
      getUsdRate,
      refreshRates,
      notificationPermission,
      notificationContentIds,
      toggleNotificationContent,
      setNotificationContentIdsSafe,
      seedDefaultNotificationContent,
      dismissedGhostIds,
      dismissGhost,
      convertFromUsd,
      formatInCurrency,
      formatFromCurrency,
    ]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}

export function useCurrencyLabel() {
  const { currencyCode } = usePreferences();
  return getCurrency(currencyCode);
}
