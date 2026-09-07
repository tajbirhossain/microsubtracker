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
} from '@/constants/currency';
import {
  DEFAULT_NOTIFICATION_CONTENT_IDS,
  type NotificationContentId,
} from '@/constants/notification-content';
import { useNetwork } from '@/context/network-context';
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

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useNetwork();
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

  const toggleNotificationContent = useCallback((id: NotificationContentId) => {
    setNotificationContentIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  }, []);

  const seedDefaultNotificationContent = useCallback(() => {
    setNotificationContentIds(DEFAULT_NOTIFICATION_CONTENT_IDS);
  }, []);

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
      setNotificationContentIds,
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
