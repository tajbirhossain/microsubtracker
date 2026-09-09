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
import { useOnboarding } from '@/context/onboarding-context';
import {
  cancelSubscription as apiCancel,
  createSubscription as apiCreate,
  listSubscriptions,
  updateSubscription as apiUpdate,
} from '@/services/api/subscriptions';
import { mapApiSubscription, toCreateBody } from '@/services/mappers/subscription';
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
import { defaultNextBillingDate, nextBillingFromStart, toDateKey } from '@/utils/subscriptions';

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
  /** YYYY-MM-DD subscription start; maps to nextBillingDate via cycle math */
  startDate?: string;
  nextBillingDate?: string;
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

function trialEndsIso(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return toDateKey(date);
}

function scaleForAmount(amount: number, cycle: BillingCycle): Subscription['scale'] {
  const monthly = cycle === 'yearly' ? amount / 12 : cycle === 'weekly' ? (amount * 52) / 12 : amount;
  return monthly >= 20 ? 'macro' : 'micro';
}

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const { isOnline, isHydrated } = useNetwork();
  const { isAuthenticated, isAuthReady } = useOnboarding();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [parserConsent, setParserConsentState] = useState<ParserConsentStatus>('unknown');
  const [queue, setQueue] = useState<SyncMutation[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const queueRef = useRef<SyncMutation[]>([]);
  const onlineRef = useRef(isOnline);
  const authRef = useRef(isAuthenticated);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    onlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    authRef.current = isAuthenticated;
  }, [isAuthenticated]);

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

  const pullFromApi = useCallback(async () => {
    const page = await listSubscriptions({ limit: 100 });
    const mapped = page.items.map(mapApiSubscription);
    setSubscriptions(mapped);
    await saveSubscriptions(mapped);
    setLastSyncedAt(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    let cancelled = false;
    (async () => {
      const [consent, pending] = await Promise.all([loadParserConsent(), loadSyncQueue()]);
      if (cancelled) return;
      setParserConsentState(consent);
      setQueue(pending);

      try {
        if (isAuthenticated && onlineRef.current) {
          await pullFromApi();
        } else {
          const local = await loadSubscriptions();
          if (!cancelled) setSubscriptions(local);
        }
      } catch (error) {
        console.warn('Failed to load subscriptions', error);
        const local = await loadSubscriptions();
        if (!cancelled) setSubscriptions(local);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthReady, isAuthenticated, pullFromApi]);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    if (!onlineRef.current || !authRef.current) return;

    const pending = queueRef.current;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      if (pending.length > 0) {
        const result = await flushMutations(pending, onlineRef.current);
        const remaining = removeAcked(queueRef.current, result.ackedIds);
        await persistQueue(remaining);
        setLastSyncedAt(result.syncedAt);
      }
      await pullFromApi();
    } catch (error) {
      if (!(error instanceof OfflineError)) {
        console.warn('Sync flush failed', error);
      }
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [persistQueue, pullFromApi]);

  useEffect(() => {
    if (!isReady || !isHydrated || !isAuthenticated) return;
    if (!isOnline) return;
    void syncNow();
  }, [isReady, isHydrated, isOnline, isAuthenticated, queue.length, syncNow]);

  const addCustom = useCallback(
    (draft: DraftSubscription) => {
      const nextBillingDate = draft.isTrial
        ? draft.nextBillingDate ?? trialEndsIso(draft.trialEndsInDays ?? 7)
        : draft.nextBillingDate ??
          (draft.startDate
            ? nextBillingFromStart(draft.billingCycle, draft.startDate)
            : defaultNextBillingDate(draft.billingCycle));

      const optimistic: Subscription = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: draft.name.trim(),
        amount: draft.amount,
        currency: draft.currency ?? 'USD',
        billingCycle: draft.billingCycle,
        category: draft.category,
        scale: scaleForAmount(draft.amount, draft.billingCycle),
        nextBillingDate,
        color: draft.color,
        icon: draft.icon,
        providerKey: draft.providerKey,
        status: 'active',
        isTrial: draft.isTrial,
        trialEndsInDays: draft.trialEndsInDays,
      };

      setSubscriptions((prev) => {
        const exists = prev.some((sub) => sub.name.toLowerCase() === optimistic.name.toLowerCase());
        if (exists) return prev;
        const next = [optimistic, ...prev];
        void saveSubscriptions(next);
        return next;
      });

      if (authRef.current && onlineRef.current) {
        void (async () => {
          try {
            const created = await apiCreate(
              toCreateBody({
                ...draft,
                name: optimistic.name,
                scale: optimistic.scale,
                nextBillingDate: optimistic.nextBillingDate,
              })
            );
            const mapped = mapApiSubscription(created);
            setSubscriptions((prev) => {
              const withoutLocal = prev.filter(
                (sub) =>
                  sub.id !== optimistic.id &&
                  sub.name.toLowerCase() !== mapped.name.toLowerCase()
              );
              const next = [mapped, ...withoutLocal];
              void saveSubscriptions(next);
              return next;
            });
          } catch (error) {
            console.warn('Create subscription failed, queuing', error);
            await enqueue(createMutation('create', optimistic.id, optimistic));
          }
        })();
      } else {
        void enqueue(createMutation('create', optimistic.id, optimistic)).then(() => {
          if (onlineRef.current && authRef.current) void syncNow();
        });
      }

      return optimistic;
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
        startDate: overrides?.startDate,
        nextBillingDate: overrides?.nextBillingDate,
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
            ? trialEndsIso(trialEndsInDays)
            : updates.nextBillingDate ?? current.nextBillingDate,
      };

      const next = subscriptions.map((sub) => (sub.id === subscriptionId ? updated : sub));
      setSubscriptions(next);
      void saveSubscriptions(next);

      const mutationPayload = { ...updates, version: current.version };

      if (authRef.current && onlineRef.current && typeof current.version === 'number') {
        void (async () => {
          try {
            const remote = await apiUpdate(subscriptionId, {
              version: current.version!,
              ...(updates.name != null ? { name: updates.name } : {}),
              ...(updates.amount != null ? { amount: updates.amount } : {}),
              ...(updates.currency != null ? { currency: updates.currency } : {}),
              ...(updates.billingCycle != null ? { billingCycle: updates.billingCycle } : {}),
              ...(updates.category != null
                ? { categorySlug: updates.category.toLowerCase().replace(/\s+/g, '-') }
                : {}),
              ...(updates.nextBillingDate != null
                ? { nextBillingDate: updates.nextBillingDate }
                : {}),
              ...(updates.isTrial != null ? { isTrial: Boolean(updates.isTrial) } : {}),
              ...(updates.color != null ? { color: updates.color } : {}),
              ...(updates.icon != null ? { icon: updates.icon } : {}),
              ...(updates.providerKey != null ? { providerKey: updates.providerKey } : {}),
              ...(updates.isTrial === false ? { trialEndsAt: null } : {}),
              ...(isTrial && trialEndsInDays != null
                ? { trialEndsAt: trialEndsIso(trialEndsInDays) }
                : {}),
            });
            const mapped = mapApiSubscription(remote);
            setSubscriptions((prev) => {
              const replaced = prev.map((sub) => (sub.id === subscriptionId ? mapped : sub));
              void saveSubscriptions(replaced);
              return replaced;
            });
          } catch (error) {
            console.warn('Update subscription failed, queuing', error);
            await enqueue(createMutation('update', subscriptionId, mutationPayload));
          }
        })();
      } else {
        void enqueue(createMutation('update', subscriptionId, mutationPayload));
        if (onlineRef.current && authRef.current) void syncNow();
      }

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
      const current = subscriptions.find((sub) => sub.id === subscriptionId);

      setSubscriptions((prev) => {
        const next = prev.map((sub) =>
          sub.id === subscriptionId
            ? { ...sub, status: 'cancelled' as const, isTrial: false, trialEndsInDays: undefined }
            : sub
        );
        void saveSubscriptions(next);
        return next;
      });

      if (authRef.current && onlineRef.current && typeof current?.version === 'number') {
        try {
          const remote = await apiCancel(subscriptionId, current.version);
          const mapped = mapApiSubscription(remote);
          setSubscriptions((prev) => {
            const next = prev.map((sub) => (sub.id === subscriptionId ? mapped : sub));
            void saveSubscriptions(next);
            return next;
          });
          return;
        } catch (error) {
          console.warn('Cancel failed, queuing', error);
        }
      }

      await enqueue(createMutation('cancel', subscriptionId, { version: current?.version }));
      if (onlineRef.current && authRef.current) void syncNow();
    },
    [subscriptions, enqueue, syncNow]
  );

  const keepSubscription = useCallback(
    async (subscriptionId: string) => {
      const current = subscriptions.find((sub) => sub.id === subscriptionId);

      setSubscriptions((prev) => {
        const next = prev.map((sub) =>
          sub.id === subscriptionId ? { ...sub, isTrial: false, trialEndsInDays: undefined } : sub
        );
        void saveSubscriptions(next);
        return next;
      });

      if (authRef.current && onlineRef.current && typeof current?.version === 'number') {
        try {
          const remote = await apiUpdate(subscriptionId, {
            version: current.version,
            isTrial: false,
            trialEndsAt: null,
          });
          const mapped = mapApiSubscription(remote);
          setSubscriptions((prev) => {
            const next = prev.map((sub) => (sub.id === subscriptionId ? mapped : sub));
            void saveSubscriptions(next);
            return next;
          });
          return;
        } catch (error) {
          console.warn('Keep subscription failed, queuing', error);
        }
      }

      await enqueue(createMutation('keep', subscriptionId, { version: current?.version }));
      if (onlineRef.current && authRef.current) void syncNow();
    },
    [subscriptions, enqueue, syncNow]
  );

  const getById = useCallback(
    (subscriptionId: string) => subscriptions.find((sub) => sub.id === subscriptionId),
    [subscriptions]
  );

  const refresh = useCallback(async () => {
    if (onlineRef.current && authRef.current) {
      await syncNow();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
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
