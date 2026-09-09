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
  convertUsd,
  getCurrency,
  type CurrencyCode,
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
import { formatMoney } from '@/utils/subscriptions';

export type RatesStatus = 'live' | 'cached';
export type NotificationPermissionStatus = 'unknown' | 'granted' | 'denied';

type PreferencesContextValue = {
  currencyCode: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  ratesStatus: RatesStatus;
  setRatesStatus: (status: RatesStatus) => void;
  notificationPermission: NotificationPermissionStatus;
  setNotificationPermission: (status: NotificationPermissionStatus) => void;
  notificationContentIds: NotificationContentId[];
  toggleNotificationContent: (id: NotificationContentId) => void;
  setNotificationContentIds: (ids: NotificationContentId[]) => void;
  seedDefaultNotificationContent: () => void;
  dismissedGhostIds: string[];
  dismissGhost: (subscriptionId: string) => void;
  convertFromUsd: (amountUsd: number) => number;
  formatInCurrency: (amountUsd: number, compact?: boolean) => string;
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
  const [ratesStatus, setRatesStatus] = useState<RatesStatus>('live');
  const [manualCached, setManualCached] = useState(false);
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
    if (!isAuthReady || !isAuthenticated || !isOnline) return;

    let cancelled = false;
    (async () => {
      try {
        const [prefs, rates] = await Promise.all([
          getNotificationPreferences(),
          getCurrencyRates('USD'),
        ]);
        if (cancelled) return;
        setNotificationContentIds(prefsToContentIds(prefs));
        setRatesStatus(rates.stale || rates.fallback ? 'cached' : 'live');
      } catch {
        if (!cancelled) setRatesStatus('cached');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthReady, isAuthenticated, isOnline]);

  useEffect(() => {
    if (!isOnline) {
      setRatesStatus('cached');
      return;
    }
    if (!manualCached) {
      setRatesStatus('live');
    }
  }, [isOnline, manualCached]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyCode(code);
  }, []);

  const setRatesStatusSafe = useCallback((status: RatesStatus) => {
    setManualCached(status === 'cached');
    setRatesStatus(status);
  }, []);

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
    (amountUsd: number) => convertUsd(amountUsd, currencyCode),
    [currencyCode]
  );

  const formatInCurrency = useCallback(
    (amountUsd: number, compact = false) =>
      formatMoney(convertUsd(amountUsd, currencyCode), currencyCode, compact),
    [currencyCode]
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      currencyCode,
      setCurrency,
      ratesStatus,
      setRatesStatus: setRatesStatusSafe,
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
    }),
    [
      currencyCode,
      setCurrency,
      ratesStatus,
      setRatesStatusSafe,
      notificationPermission,
      notificationContentIds,
      toggleNotificationContent,
      setNotificationContentIdsSafe,
      seedDefaultNotificationContent,
      dismissedGhostIds,
      dismissGhost,
      convertFromUsd,
      formatInCurrency,
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
