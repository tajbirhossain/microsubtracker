import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  CURRENCIES,
  formatCachedRateLabel,
  type CurrencyCode,
} from '@/constants/currency';
import { DashboardColors } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';

type Props = {
  monthlyTotalUsd: number;
  compact?: boolean;
  onCompactPress?: () => void;
};

export function CurrencySelector({ monthlyTotalUsd, compact = false, onCompactPress }: Props) {
  const {
    currencyCode,
    setCurrency,
    ratesStatus,
    ratesFetchedAt,
    getUsdRate,
    refreshRates,
    formatInCurrency,
  } = usePreferences();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [query]);

  const onRetry = async () => {
    setRefreshing(true);
    try {
      await refreshRates();
    } finally {
      setRefreshing(false);
    }
  };

  if (compact) {
    return (
      <Pressable onPress={onCompactPress} style={styles.compactChip} hitSlop={6}>
        <Text style={styles.compactCode}>{currencyCode}</Text>
        <Text style={styles.compactCaret}>▾</Text>
      </Pressable>
    );
  }

  const rate = getUsdRate(currencyCode);

  return (
    <View style={styles.wrap}>
      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Monthly total in {currencyCode}</Text>
        <Text style={styles.previewAmount}>{formatInCurrency(monthlyTotalUsd)}</Text>
        <Text style={styles.previewMeta}>
          1 USD = {rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} {currencyCode}
        </Text>
        {ratesStatus === 'cached' ? (
          <>
            <Text style={styles.cachedNote}>
              Live FX unavailable — using saved rates · updated{' '}
              {formatCachedRateLabel(ratesFetchedAt)}
            </Text>
            <Pressable onPress={() => void onRetry()} hitSlop={6} disabled={refreshing}>
              <Text style={styles.retryLink}>{refreshing ? 'Refreshing…' : 'Retry live rates'}</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.liveNote}>
            Live rates · updated {formatCachedRateLabel(ratesFetchedAt)}
          </Text>
        )}
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search currency"
        placeholderTextColor={DashboardColors.textMuted}
        style={styles.search}
        autoCorrect={false}
        autoCapitalize="characters"
      />

      <ScrollView
        style={styles.list}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {filtered.map((currency) => {
          const active = currency.code === currencyCode;
          return (
            <Pressable
              key={currency.code}
              onPress={() => setCurrency(currency.code as CurrencyCode)}
              style={[styles.row, active && styles.rowActive]}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowCode}>
                  {currency.symbol}  {currency.code}
                </Text>
                <Text style={styles.rowName}>{currency.name}</Text>
              </View>
              <View style={[styles.check, active && styles.checkOn]}>
                <Text style={styles.checkMark}>{active ? '✓' : ''}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  compactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: DashboardColors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  compactCode: {
    color: DashboardColors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  compactCaret: {
    color: DashboardColors.textMuted,
    fontSize: 10,
  },
  previewCard: {
    backgroundColor: DashboardColors.accentSoft,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(91,158,255,0.28)',
    gap: 4,
  },
  previewLabel: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  previewAmount: {
    color: DashboardColors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  previewMeta: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  cachedNote: {
    marginTop: 6,
    color: DashboardColors.macro,
    fontSize: 12,
    fontWeight: '600',
  },
  liveNote: {
    marginTop: 6,
    color: DashboardColors.micro,
    fontSize: 12,
    fontWeight: '600',
  },
  retryLink: {
    marginTop: 6,
    color: DashboardColors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  search: {
    backgroundColor: DashboardColors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: DashboardColors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  list: {
    maxHeight: 220,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  rowActive: {
    borderColor: 'rgba(91,158,255,0.45)',
    backgroundColor: DashboardColors.accentSoft,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowCode: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowName: {
    color: DashboardColors.textMuted,
    fontSize: 12,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: DashboardColors.accent,
    borderColor: DashboardColors.accent,
  },
  checkMark: {
    color: '#041018',
    fontSize: 13,
    fontWeight: '800',
  },
});
