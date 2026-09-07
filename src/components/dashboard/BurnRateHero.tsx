import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CurrencySelector } from '@/components/engagement/CurrencySelector';
import { formatCachedRateLabel } from '@/constants/currency';
import { DashboardColors } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';

type Period = 'monthly' | 'yearly';

type Props = {
  monthlyTotal: number;
  yearlyTotal: number;
  period: Period;
  onPeriodChange: (period: Period) => void;
  activeCount: number;
  onCurrencyPress?: () => void;
};

export function BurnRateHero({
  monthlyTotal,
  yearlyTotal,
  period,
  onPeriodChange,
  activeCount,
  onCurrencyPress,
}: Props) {
  const { formatInCurrency, ratesStatus } = usePreferences();
  const amountUsd = period === 'monthly' ? monthlyTotal : yearlyTotal;
  const periodHint = period === 'monthly' ? 'this month' : 'this year';

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['rgba(91,158,255,0.18)', 'rgba(10,26,58,0.35)', 'transparent']}
        locations={[0, 0.45, 1]}
        style={styles.glow}
      />

      <View style={styles.topRow}>
        <Text style={styles.eyebrow}>{period === 'monthly' ? 'Monthly spend' : 'Yearly spend'}</Text>
        <CurrencySelector
          monthlyTotalUsd={monthlyTotal}
          compact
          onCompactPress={onCurrencyPress}
        />
      </View>
      <Text style={styles.amount}>{formatInCurrency(amountUsd)}</Text>
      <Text style={styles.sub}>
        Across {activeCount} subscription{activeCount === 1 ? '' : 's'} · {periodHint}
      </Text>
      {ratesStatus === 'cached' ? (
        <Text style={styles.cached}>Cached FX · {formatCachedRateLabel()}</Text>
      ) : null}

      <View style={styles.periodRow}>
        {(['monthly', 'yearly'] as const).map((value) => {
          const active = period === value;
          return (
            <Pressable
              key={value}
              onPress={() => onPeriodChange(value)}
              style={[styles.periodChip, active && styles.periodChipActive]}>
              <Text style={[styles.periodLabel, active && styles.periodLabelActive]}>
                {value === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eyebrow: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  amount: {
    marginTop: 8,
    color: DashboardColors.text,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  sub: {
    marginTop: 6,
    color: DashboardColors.textMuted,
    fontSize: 14,
  },
  cached: {
    marginTop: 4,
    color: DashboardColors.macro,
    fontSize: 11,
    fontWeight: '600',
  },
  periodRow: {
    marginTop: 18,
    flexDirection: 'row',
    backgroundColor: DashboardColors.surface,
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  periodChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  periodChipActive: {
    backgroundColor: DashboardColors.surfaceElevated,
  },
  periodLabel: {
    color: DashboardColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  periodLabelActive: {
    color: DashboardColors.text,
  },
});
