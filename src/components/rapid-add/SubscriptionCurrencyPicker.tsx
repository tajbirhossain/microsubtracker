import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CURRENCIES, getCurrency, type CurrencyCode } from '@/constants/currency';
import { DashboardColors } from '@/constants/dashboard';

type Props = {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  label?: string;
};

export function SubscriptionCurrencyPicker({ value, onChange, label = 'Currency' }: Props) {
  const [open, setOpen] = useState(false);
  const selected = getCurrency(value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.trigger} onPress={() => setOpen((prev) => !prev)}>
        <Text style={styles.triggerText}>
          {selected.symbol} {selected.code}
        </Text>
        <Text style={styles.caret}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open ? (
        <ScrollView
          style={styles.menu}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {CURRENCIES.map((currency) => {
            const active = currency.code === value;
            return (
              <Pressable
                key={currency.code}
                onPress={() => {
                  onChange(currency.code);
                  setOpen(false);
                }}
                style={[styles.row, active && styles.rowActive]}>
                <Text style={styles.rowCode}>
                  {currency.symbol} {currency.code}
                </Text>
                <Text style={styles.rowName}>{currency.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  trigger: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    backgroundColor: DashboardColors.surfaceElevated,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    color: DashboardColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  caret: {
    color: DashboardColors.textMuted,
    fontSize: 11,
  },
  menu: {
    maxHeight: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    backgroundColor: DashboardColors.surface,
  },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: DashboardColors.border,
  },
  rowActive: {
    backgroundColor: DashboardColors.accentSoft,
  },
  rowCode: {
    color: DashboardColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  rowName: {
    color: DashboardColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
