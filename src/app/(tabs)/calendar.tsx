import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthCalendar } from '@/components/dashboard/MonthCalendar';
import { UpcomingTimeline } from '@/components/dashboard/UpcomingTimeline';
import { OfflineBanner } from '@/components/engagement/OfflineBanner';
import { DashboardColors } from '@/constants/dashboard';
import { BottomTabInset } from '@/constants/theme';
import { usePreferences } from '@/context/preferences-context';
import { useSubscriptions } from '@/context/subscriptions-context';
import { toMonthlyUsd } from '@/utils/subscriptions';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { activeSubscriptions, syncNow } = useSubscriptions();
  const { formatInCurrency, rates } = usePreferences();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthSubs = useMemo(() => {
    return activeSubscriptions.filter((sub) => {
      const [y, m] = sub.nextBillingDate.split('-').map(Number);
      return y === cursor.year && m === cursor.month + 1;
    });
  }, [cursor, activeSubscriptions]);

  const selectedSubs = useMemo(() => {
    if (!selectedDate) return monthSubs;
    return activeSubscriptions.filter((sub) => sub.nextBillingDate === selectedDate);
  }, [selectedDate, monthSubs, activeSubscriptions]);

  const monthBurn = monthSubs.reduce((sum, sub) => sum + toMonthlyUsd(sub, rates), 0);

  const shiftMonth = (delta: number) => {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
    setSelectedDate(null);
  };

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
            paddingBottom: insets.bottom + BottomTabInset + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Timeline</Text>
          <Text style={styles.title}>Billing calendar</Text>
          <Text style={styles.subtitle}>
            See when charges land — tap a day with dots to inspect that renewal.
          </Text>
        </View>

        <OfflineBanner onPressSync={() => void syncNow()} />

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Charges this month</Text>
            <Text style={styles.statValue}>{monthSubs.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Est. monthly impact</Text>
            <Text style={styles.statValue}>{formatInCurrency(monthBurn)}</Text>
          </View>
        </View>

        <MonthCalendar
          year={cursor.year}
          month={cursor.month}
          subscriptions={activeSubscriptions}
          selectedDate={selectedDate}
          onSelectDate={(dateKey) =>
            setSelectedDate((prev) => (prev === dateKey ? null : dateKey))
          }
          onPrevMonth={() => shiftMonth(-1)}
          onNextMonth={() => shiftMonth(1)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDate ? 'Selected day' : 'Upcoming this month'}
          </Text>
          <Text style={styles.sectionMeta}>{selectedSubs.length}</Text>
        </View>

        <UpcomingTimeline
          subscriptions={selectedSubs}
          emptyLabel={selectedDate ? 'No charges on this day' : 'No charges this month'}
        />
      </ScrollView>
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
  header: {
    gap: 6,
  },
  eyebrow: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: DashboardColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: DashboardColors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    gap: 6,
  },
  statLabel: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: DashboardColors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: DashboardColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionMeta: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
