import { StyleSheet, Text, View } from 'react-native';

import { DashboardColors, type Subscription } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';
import { cycleLabel, formatShortDate, formatWeekday, groupByBillingDate } from '@/utils/subscriptions';

type Props = {
  subscriptions: Subscription[];
  emptyLabel?: string;
};

export function UpcomingTimeline({ subscriptions, emptyLabel = 'No upcoming charges' }: Props) {
  const { formatInCurrency } = usePreferences();
  const groups = groupByBillingDate(subscriptions);

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{emptyLabel}</Text>
        <Text style={styles.emptyBody}>Pick another day or clear filters to see your timeline.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {groups.map(({ date, items }) => {
        // Calendar day totals are what actually charges that day — not monthlyized burn.
        const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);

        return (
          <View key={date} style={styles.group}>
            <View style={styles.rail}>
              <View style={styles.railDot} />
              <View style={styles.railLine} />
            </View>

            <View style={styles.groupBody}>
              <View style={styles.groupHeader}>
                <View>
                  <Text style={styles.dateLabel}>{formatShortDate(date)}</Text>
                  <Text style={styles.weekday}>{formatWeekday(date)}</Text>
                </View>
                <Text style={styles.dayTotal}>{formatInCurrency(dayTotal)}</Text>
              </View>

              {items.map((item) => (
                <View key={item.id} style={styles.item}>
                  <View style={[styles.swatch, { backgroundColor: item.color }]} />
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemAmount}>
                    {formatInCurrency(item.amount)}
                    {cycleLabel(item.billingCycle)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 4,
  },
  group: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
  },
  rail: {
    width: 14,
    alignItems: 'center',
  },
  railDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DashboardColors.accent,
    marginTop: 6,
  },
  railLine: {
    flex: 1,
    width: 2,
    backgroundColor: DashboardColors.border,
    marginTop: 4,
  },
  groupBody: {
    flex: 1,
    backgroundColor: DashboardColors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    marginBottom: 10,
    gap: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateLabel: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  weekday: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  dayTotal: {
    color: DashboardColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    flex: 1,
    color: DashboardColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  itemAmount: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    gap: 6,
  },
  emptyTitle: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBody: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
