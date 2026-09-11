import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CancelGuideDrawer } from '@/components/actions/CancelGuideDrawer';
import { TrialCountdownRow } from '@/components/actions/TrialCountdownCard';
import { BrandLogo } from '@/components/BrandLogo';
import { BurnRateHero } from '@/components/dashboard/BurnRateHero';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ScaleBreakdown } from '@/components/dashboard/ScaleBreakdown';
import { SearchFilterBar } from '@/components/dashboard/SearchFilterBar';
import { SubscriptionRow } from '@/components/dashboard/SubscriptionRow';
import { CurrencySheet } from '@/components/engagement/CurrencySheet';
import { GhostAlerts } from '@/components/engagement/GhostAlerts';
import { OfflineBanner } from '@/components/engagement/OfflineBanner';
import { EditSubscriptionSheet } from '@/components/rapid-add/EditSubscriptionSheet';
import { ParserConsentSheet } from '@/components/rapid-add/ParserConsentSheet';
import { RapidAddSheet } from '@/components/rapid-add/RapidAddSheet';
import { StatePanel } from '@/components/ui/StatePanel';
import { DashboardColors, type SpendScale, type Subscription } from '@/constants/dashboard';
import { BottomTabInset } from '@/constants/theme';
import { useNetwork } from '@/context/network-context';
import { usePreferences } from '@/context/preferences-context';
import {
  useSubscriptions,
  type ListFilter,
  type ListSort,
} from '@/context/subscriptions-context';
import { buildTrialActionCards } from '@/utils/cancellation';
import {
  daysUntil,
  sumMonthly,
  sumYearly,
  toMonthlyUsd,
  toYearlyUsd,
} from '@/utils/subscriptions';

type Period = 'monthly' | 'yearly';
type ScaleFilter = SpendScale | 'all';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();
  const {
    activeSubscriptions,
    parserConsent,
    addFromCatalog,
    addCustom,
    updateSubscription,
    setParserConsent,
    markCancelled,
    keepSubscription,
    getById,
    refresh,
    syncNow,
    isReady,
  } = useSubscriptions();
  const { formatFromCurrency, notificationPermission, rates } = usePreferences();

  const [period, setPeriod] = useState<Period>('monthly');
  const [scale, setScale] = useState<ScaleFilter>('all');
  const [query, setQuery] = useState('');
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [sort, setSort] = useState<ListSort>('amount');
  const [refreshing, setRefreshing] = useState(false);
  const [rapidOpen, setRapidOpen] = useState(false);
  const [parserOpen, setParserOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [cancelSubId, setCancelSubId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setScale('all');
    try {
      await refresh();
      if (!isOnline) {
        showToast('Offline — showing local data');
      }
    } finally {
      setRefreshing(false);
    }
  }, [refresh, isOnline, showToast]);

  const filtered = useMemo(() => {
    if (!isReady) return [];
    const q = query.trim().toLowerCase();

    let list = activeSubscriptions.filter((sub) => {
      if (scale !== 'all' && sub.scale !== scale) return false;
      if (q && !sub.name.toLowerCase().includes(q) && !sub.category.toLowerCase().includes(q)) {
        return false;
      }

      switch (listFilter) {
        case 'monthly':
          return sub.billingCycle === 'monthly' || sub.billingCycle === 'weekly';
        case 'yearly':
          return sub.billingCycle === 'yearly';
        case 'trials':
          return Boolean(sub.isTrial);
        case 'unused':
          return (sub.unusedDays ?? 0) >= 30;
        case 'expiry':
          return daysUntil(sub.nextBillingDate) <= 7;
        default:
          return true;
      }
    });

    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'soonest') return a.nextBillingDate.localeCompare(b.nextBillingDate);
      const aVal = period === 'monthly' ? toMonthlyUsd(a, rates) : toYearlyUsd(a, rates);
      const bVal = period === 'monthly' ? toMonthlyUsd(b, rates) : toYearlyUsd(b, rates);
      return bVal - aVal;
    });

    return list;
  }, [activeSubscriptions, scale, query, listFilter, sort, period, isReady, rates]);

  const monthlyTotal = sumMonthly(filtered, rates);
  const yearlyTotal = sumYearly(filtered, rates);
  const microSubs = filtered.filter((s) => s.scale === 'micro');
  const macroSubs = filtered.filter((s) => s.scale === 'macro');
  const amountFor = (subs: Subscription[]) =>
    period === 'monthly' ? sumMonthly(subs, rates) : sumYearly(subs, rates);

  const trialCards = useMemo(
    () =>
      buildTrialActionCards(activeSubscriptions, (amount, currency) =>
        formatFromCurrency(amount, currency)
      ).slice(0, 4),
    [activeSubscriptions, formatFromCurrency]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const existingNames = activeSubscriptions.map((sub) => sub.name);
  const cancelTarget = cancelSubId ? getById(cancelSubId) ?? null : null;
  const editTarget = editSubId ? getById(editSubId) ?? null : null;
  const monthlyAll = sumMonthly(activeSubscriptions, rates);
  const hasNoSubscriptions = isReady && activeSubscriptions.length === 0;
  const hasFilters =
    Boolean(query.trim()) || listFilter !== 'all' || scale !== 'all';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[DashboardColors.backgroundTop, DashboardColors.backgroundMid, DashboardColors.background]}
        locations={[0, 0.28, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + BottomTabInset + 88,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DashboardColors.accent}
            colors={[DashboardColors.accent]}
            progressBackgroundColor={DashboardColors.surfaceElevated}
          />
        }>
        <View style={styles.topBar}>
          <View style={styles.brandBlock}>
            <View style={styles.brandTitleRow}>
              <BrandLogo size={28} />
              <Text style={styles.brand}>Micro Sub Tracker</Text>
            </View>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable style={styles.addHeaderBtn} onPress={() => setRapidOpen(true)} hitSlop={6}>
              <Text style={styles.addHeaderPlus}>+</Text>
              <Text style={styles.addHeaderLabel}>Add</Text>
            </Pressable>
            <Pressable
              style={styles.avatar}
              hitSlop={8}
              onPress={() => router.push('/(tabs)/preferences')}
              accessibilityRole="button"
              accessibilityLabel="Open preferences">
              <Text style={styles.avatarText}>T</Text>
            </Pressable>
          </View>
        </View>

        <OfflineBanner onPressSync={() => void syncNow()} />

        {!isReady ? (
          <DashboardSkeleton />
        ) : (
          <>
            <BurnRateHero
              monthlyTotal={monthlyTotal}
              yearlyTotal={yearlyTotal}
              period={period}
              onPeriodChange={setPeriod}
              activeCount={filtered.length}
              onCurrencyPress={() => setCurrencyOpen(true)}
            />

            <ScaleBreakdown
              microTotal={amountFor(microSubs)}
              macroTotal={amountFor(macroSubs)}
              microCount={microSubs.length}
              macroCount={macroSubs.length}
              selected={scale}
              onSelect={setScale}
              periodLabel={period === 'monthly' ? 'Monthly view' : 'Yearly view'}
            />

            {parserConsent === 'unknown' || parserConsent === 'allowed' ? (
              <Pressable style={styles.smartBanner} onPress={() => setParserOpen(true)}>
                <View style={styles.smartIcon}>
                  <Text style={styles.smartIconText}>⌁</Text>
                </View>
                <View style={styles.smartCopy}>
                  <Text style={styles.smartTitle}>Scan a receipt</Text>
                  <Text style={styles.smartBody}>
                    Paste invoice text or capture a photo to suggest a plan
                  </Text>
                </View>
                <Text style={styles.smartChevron}>›</Text>
              </Pressable>
            ) : null}

            {parserConsent === 'denied' ? (
              <StatePanel
                tone="neutral"
                title="Manual entry only"
                body="Receipt scan is off. Add plans yourself anytime — or scan an invoice when you’re ready."
                ctaLabel="Add a subscription"
                onCtaPress={() => setRapidOpen(true)}
                secondaryLabel="Scan a receipt"
                onSecondaryPress={() => setParserOpen(true)}
              />
            ) : null}

            {notificationPermission === 'denied' || notificationPermission === 'unknown' ? (
              <StatePanel
                tone="warning"
                title={
                  notificationPermission === 'denied'
                    ? 'Notifications blocked'
                    : 'Enable notifications'
                }
                body={
                  notificationPermission === 'denied'
                    ? 'Renewal and trial alerts can’t reach you until permission is allowed in system Settings.'
                    : 'Turn on push alerts so renewals and trial endings don’t sneak up on you.'
                }
                ctaLabel="Open preferences"
                onCtaPress={() => router.push('/(tabs)/preferences')}
              />
            ) : null}

            <TrialCountdownRow
              cards={trialCards}
              onOpenGuide={(id) => setCancelSubId(id)}
              onKeep={async (id) => {
                const sub = getById(id);
                await keepSubscription(id);
                showToast(sub ? `Keeping ${sub.name}` : 'Kept plan');
              }}
            />

            <GhostAlerts
              subscriptions={activeSubscriptions}
              onOpenGuide={(id) => setCancelSubId(id)}
            />

            <View style={styles.listHeader}>
              <Text style={styles.sectionLabel}>Your subscriptions</Text>
              <Text style={styles.countLabel}>{filtered.length}</Text>
            </View>

            {!hasNoSubscriptions ? (
              <SearchFilterBar
                query={query}
                onQueryChange={setQuery}
                filter={listFilter}
                onFilterChange={setListFilter}
                sort={sort}
                onSortChange={setSort}
              />
            ) : null}

            <View style={styles.list}>
              {hasNoSubscriptions ? (
                <StatePanel
                  title="No subscriptions yet"
                  body="Add your first plan to see burn rate, trials, and renewal timing in one place."
                  ctaLabel="Add a subscription"
                  onCtaPress={() => setRapidOpen(true)}
                  secondaryLabel={
                    parserConsent === 'unknown' ? 'Scan a receipt' : undefined
                  }
                  onSecondaryPress={
                    parserConsent === 'unknown' ? () => setParserOpen(true) : undefined
                  }
                />
              ) : filtered.length === 0 ? (
                <StatePanel
                  title="Nothing matches"
                  body={
                    hasFilters
                      ? 'Try another filter, clear search, or add a plan with the + button.'
                      : 'Try another filter or clear search to see your plans.'
                  }
                  ctaLabel="Add a subscription"
                  onCtaPress={() => setRapidOpen(true)}
                  secondaryLabel={hasFilters ? 'Clear filters' : undefined}
                  onSecondaryPress={
                    hasFilters
                      ? () => {
                          setQuery('');
                          setListFilter('all');
                          setScale('all');
                        }
                      : undefined
                  }
                />
              ) : (
                filtered.map((sub) => (
                  <SubscriptionRow
                    key={sub.id}
                    subscription={sub}
                    onPress={() => setEditSubId(sub.id)}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, { bottom: Math.max(insets.bottom, 12) + 10 }]}
        onPress={() => setRapidOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Add subscription">
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>

      {toast ? (
        <View style={[styles.toast, { bottom: Math.max(insets.bottom, 12) + 136 }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <RapidAddSheet
        visible={rapidOpen}
        onClose={() => setRapidOpen(false)}
        existingNames={existingNames}
        addFromCatalog={addFromCatalog}
        addCustom={addCustom}
        onAdded={(name) =>
          showToast(isOnline ? `Added ${name}` : `Added ${name} · will sync later`)
        }
        onRequestParser={() => {
          setRapidOpen(false);
          setTimeout(() => setParserOpen(true), 220);
        }}
      />

      <ParserConsentSheet
        visible={parserOpen}
        onClose={() => setParserOpen(false)}
        onAllow={() => setParserConsent('allowed')}
        onDeny={() => setParserConsent('denied')}
        onAdded={(count) => {
          showToast(count === 1 ? 'Added 1 plan from receipt' : `Added ${count} plans from receipt`);
        }}
        onManualFallback={() => setRapidOpen(true)}
        onRefreshSubscriptions={refresh}
      />

      <CurrencySheet
        visible={currencyOpen}
        onClose={() => setCurrencyOpen(false)}
        monthlyTotalUsd={monthlyAll}
      />

      <EditSubscriptionSheet
        visible={Boolean(editSubId)}
        subscription={editTarget}
        onClose={() => setEditSubId(null)}
        onSave={(id, updates) => {
          updateSubscription(id, updates);
          showToast(isOnline ? 'Saved changes' : 'Saved offline · will sync later');
        }}
        onOpenCancelGuide={(id) => {
          setTimeout(() => setCancelSubId(id), 220);
        }}
      />

      <CancelGuideDrawer
        visible={Boolean(cancelSubId)}
        subscription={cancelTarget}
        onClose={() => setCancelSubId(null)}
        onMarkedCancelled={async (id) => {
          const sub = getById(id);
          await markCancelled(id);
          showToast(sub ? `Cancelled ${sub.name}` : 'Marked as cancelled');
        }}
        onKept={async (id) => {
          const sub = getById(id);
          await keepSubscription(id);
          showToast(sub ? `Keeping ${sub.name}` : 'Kept plan');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    paddingRight: 14,
    height: 36,
    borderRadius: 18,
  },
  addHeaderPlus: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
    marginTop: -1,
  },
  addHeaderLabel: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  greeting: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  brandBlock: {
    flexShrink: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: {
    color: DashboardColors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DashboardColors.surfaceElevated,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  smartBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: DashboardColors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(91,158,255,0.3)',
  },
  smartIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(91,158,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartIconText: {
    color: DashboardColors.accent,
    fontSize: 18,
  },
  smartCopy: {
    flex: 1,
    gap: 2,
  },
  smartTitle: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  smartBody: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  smartChevron: {
    color: DashboardColors.accent,
    fontSize: 22,
    fontWeight: '600',
  },
  sectionLabel: {
    color: DashboardColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countLabel: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    gap: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  fabPlus: {
    color: '#000',
    fontSize: 30,
    fontWeight: '500',
    marginTop: -2,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: DashboardColors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  toastText: {
    color: DashboardColors.text,
    fontWeight: '600',
    fontSize: 13,
  },
});
