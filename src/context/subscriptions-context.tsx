import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { type BillingCycle, type Subscription } from '@/constants/dashboard';
import type { CatalogService } from '@/constants/service-catalog';
import { useNetwork } from '@/context/network-context';
import {
  clearDemoSubscriptions,
  loadParserConsent,
  loadSubscriptions,
  loadSyncQueue,
  saveParserConsent,
  saveSubscriptions,
  saveSyncQueue,
  seedDemoSubscriptions,
} from '@/services/local-store';
import { flushMutations, OfflineError } from '@/services/sync-api';
import { createMutation, enqueueMutation, removeAcked } from '@/services/sync-queue';
import type { SyncMutation } from '@/types/sync';

export type ParserConsentStatus = 'unknown' | 'allowed' | 'denied';

export type ListFilter = 'all' | 'monthly' | 'yearly' | 'trials' | 'unused' | 'expiry';
export type ListSort = 'amount' | 'name' | 'soonest';

export type DraftSubscription = {
  name: string;
  amount: number;
  currency?: string;
  billingCycle: BillingCycle;
  category: string;
  color: string;
  icon: string;
  providerKey?: string;
  isTrial?: boolean;
  trialEndsInDays?: number;
};

type SubscriptionUpdates = Partial<
  Pick<
    Subscription,
    | 'name'
    | 'amount'
    | 'currency'
    | 'billingCycle'
    | 'category'
    | 'color'
    | 'icon'
    | 'providerKey'
    | 'nextBillingDate'
    | 'isTrial'
    | 'trialEndsInDays'
  >
>;

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  activeSubscriptions: Subscription[];
  parserConsent: ParserConsentStatus;
  isReady: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  addFromCatalog: (service: CatalogService, overrides?: Partial<DraftSubscription>) => Subscription;
  addCustom: (draft: DraftSubscription) => Subscription;
  addManyFromCatalog: (services: CatalogService[]) => void;
  updateSubscription: (subscriptionId: string, updates: SubscriptionUpdates) => Subscription | null;
  setParserConsent: (status: ParserConsentStatus) => void;
  markCancelled: (subscriptionId: string) => Promise<void>;
  keepSubscription: (subscriptionId: string) => Promise<void>;
  getById: (subscriptionId: string) => Subscription | undefined;
  refresh: () => Promise<void>;
  syncNow: () => Promise<void>;
  clearDemoData: () => Promise<void>;
  loadDemoData: () => Promise<void>;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);

function nextBillingIso(daysFromNow = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function scaleForAmount(amount: number, cycle: BillingCycle): Subscription['scale'] {
  const monthly = cycle === 'yearly' ? amount / 12 : cycle === 'weekly' ? (amount * 52) / 12 : amount;
  return monthly >= 20 ? 'macro' : 'micro';
}

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const { isOnline, isHydrated } = useNetwork();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [parserConsent, setParserConsentState] = useState<ParserConsentStatus>('unknown');
  const [queue, setQueue] = useState<SyncMutation[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const queueRef = useRef<SyncMutation[]>([]);
  const onlineRef = useRef(isOnline);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    onlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [subs, consent, pending] = await Promise.all([
        loadSubscriptions(),
        loadParserConsent(),
        loadSyncQueue(),
      ]);
      if (cancelled) return;
      setSubscriptions(subs);
      setParserConsentState(consent);
      setQueue(pending);
      setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistQueue = useCallback(async (next: SyncMutation[]) => {
    queueRef.current = next;
    setQueue(next);
    await saveSyncQueue(next);
  }, []);

  const enqueue = useCallback(
    async (mutation: SyncMutation) => {
      const next = enqueueMutation(queueRef.current, mutation);
      await persistQueue(next);
    },
    [persistQueue]
  );

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    if (!onlineRef.current) return;

    const pending = queueRef.current;
    if (pending.length === 0) return;

    syncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await flushMutations(pending, onlineRef.current);
      const remaining = removeAcked(queueRef.current, result.ackedIds);
      await persistQueue(remaining);
      setLastSyncedAt(result.syncedAt);
    } catch (error) {
      if (!(error instanceof OfflineError)) {
        console.warn('Sync flush failed', error);
      }
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [persistQueue]);

  useEffect(() => {
    if (!isReady || !isHydrated) return;
    if (!isOnline) return;
    void syncNow();
  }, [isReady, isHydrated, isOnline, queue.length, syncNow]);

  const addCustom = useCallback(
    (draft: DraftSubscription) => {
      const created: Subscription = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: draft.name.trim(),
        amount: draft.amount,
        currency: draft.currency ?? 'USD',
        billingCycle: draft.billingCycle,
        category: draft.category,
        scale: scaleForAmount(draft.amount, draft.billingCycle),
        nextBillingDate: nextBillingIso(draft.isTrial ? draft.trialEndsInDays ?? 7 : 28),
        color: draft.color,
        icon: draft.icon,
        providerKey: draft.providerKey,
        status: 'active',
        isTrial: draft.isTrial,
        trialEndsInDays: draft.trialEndsInDays,
      };

      setSubscriptions((prev) => {
        const exists = prev.some((sub) => sub.name.toLowerCase() === created.name.toLowerCase());
        if (exists) return prev;

        const next = [created, ...prev];
        void saveSubscriptions(next);
        void enqueue(createMutation('create', created.id, created)).then(() => {
          if (onlineRef.current) void syncNow();
        });
        return next;
      });

      return created;
    },
    [enqueue, syncNow]
  );

  const addFromCatalog = useCallback(
    (service: CatalogService, overrides?: Partial<DraftSubscription>) => {
      return addCustom({
        name: overrides?.name ?? service.name,
        amount: overrides?.amount ?? service.amount,
        currency: overrides?.currency ?? service.currency,
        billingCycle: overrides?.billingCycle ?? service.billingCycle,
        category: overrides?.category ?? service.category,
        color: overrides?.color ?? service.color,
        icon: overrides?.icon ?? service.icon,
        providerKey: overrides?.providerKey ?? service.id,
        isTrial: overrides?.isTrial,
        trialEndsInDays: overrides?.trialEndsInDays,
      });
    },
    [addCustom]
  );

  const addManyFromCatalog = useCallback(
    (services: CatalogService[]) => {
      services.forEach((service) => addFromCatalog(service));
    },
    [addFromCatalog]
  );

  const updateSubscription = useCallback(
    (subscriptionId: string, updates: SubscriptionUpdates) => {
      const current = subscriptions.find((sub) => sub.id === subscriptionId);
      if (!current) return null;

      const amount = updates.amount ?? current.amount;
      const billingCycle = updates.billingCycle ?? current.billingCycle;
      const isTrial = updates.isTrial ?? current.isTrial;
      const trialEndsInDays =
        updates.isTrial === false
          ? undefined
          : updates.trialEndsInDays !== undefined
            ? updates.trialEndsInDays
            : current.trialEndsInDays;

      const updated: Subscription = {
        ...current,
        ...updates,
        amount,
        billingCycle,
        scale: scaleForAmount(amount, billingCycle),
        isTrial: Boolean(isTrial),
        trialEndsInDays: isTrial ? trialEndsInDays : undefined,
        nextBillingDate:
          isTrial && trialEndsInDays != null
            ? nextBillingIso(trialEndsInDays)
            : updates.nextBillingDate ?? current.nextBillingDate,
      };

      const next = subscriptions.map((sub) => (sub.id === subscriptionId ? updated : sub));
      setSubscriptions(next);
      void saveSubscriptions(next);
      void enqueue(createMutation('update', subscriptionId, updates));
      if (onlineRef.current) void syncNow();

      return updated;
    },
    [subscriptions, enqueue, syncNow]
  );

  const setParserConsent = useCallback((status: ParserConsentStatus) => {
    setParserConsentState(status);
    void saveParserConsent(status);
  }, []);

  const markCancelled = useCallback(
    async (subscriptionId: string) => {
      setSubscriptions((prev) => {
        const next = prev.map((sub) =>
          sub.id === subscriptionId
            ? { ...sub, status: 'cancelled' as const, isTrial: false, trialEndsInDays: undefined }
            : sub
        );
        void saveSubscriptions(next);
        return next;
      });
      await enqueue(createMutation('cancel', subscriptionId));
      if (onlineRef.current) void syncNow();
    },
    [enqueue, syncNow]
  );

  const keepSubscription = useCallback(
    async (subscriptionId: string) => {
      setSubscriptions((prev) => {
        const next = prev.map((sub) =>
          sub.id === subscriptionId ? { ...sub, isTrial: false, trialEndsInDays: undefined } : sub
        );
        void saveSubscriptions(next);
        return next;
      });
      await enqueue(createMutation('keep', subscriptionId));
      if (onlineRef.current) void syncNow();
    },
    [enqueue, syncNow]
  );

  const getById = useCallback(
    (subscriptionId: string) => subscriptions.find((sub) => sub.id === subscriptionId),
    [subscriptions]
  );

  const refresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (onlineRef.current) {
      await syncNow();
    }
  }, [syncNow]);

  const clearDemoData = useCallback(async () => {
    setSubscriptions([]);
    await clearDemoSubscriptions();
  }, []);

  const loadDemoData = useCallback(async () => {
    const seeded = await seedDemoSubscriptions();
    setSubscriptions(seeded);
  }, []);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((sub) => sub.status !== 'cancelled'),
    [subscriptions]
  );

  const value = useMemo<SubscriptionsContextValue>(
    () => ({
      subscriptions,
      activeSubscriptions,
      parserConsent,
      isReady,
      isSyncing,
      pendingCount: queue.length,
      lastSyncedAt,
      addFromCatalog,
      addCustom,
      addManyFromCatalog,
      updateSubscription,
      setParserConsent,
      markCancelled,
      keepSubscription,
      getById,
      refresh,
      syncNow,
      clearDemoData,
      loadDemoData,
    }),
    [
      subscriptions,
      activeSubscriptions,
      parserConsent,
      isReady,
      isSyncing,
      queue.length,
      lastSyncedAt,
      addFromCatalog,
      addCustom,
      addManyFromCatalog,
      updateSubscription,
      setParserConsent,
      markCancelled,
      keepSubscription,
      getById,
      refresh,
      syncNow,
      clearDemoData,
      loadDemoData,
    ]
  );

  return <SubscriptionsContext.Provider value={value}>{children}</SubscriptionsContext.Provider>;
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) {
    throw new Error('useSubscriptions must be used within SubscriptionsProvider');
  }
  return ctx;
}
