import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CurrencySelector } from '@/components/engagement/CurrencySelector';
import { formatCachedRateLabel } from '@/constants/currency';
import { DashboardColors } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  monthlyTotalUsd: number;
};

export function CurrencySheet({ visible, onClose, monthlyTotalUsd }: Props) {
  const insets = useSafeAreaInsets();
  const { ratesStatus, currencyCode, ratesFetchedAt } = usePreferences();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.overlay} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>Pricing</Text>
              <Text style={styles.title}>Display currency</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.hint}>
              Convert your burn rate into the currency you think in. Active: {currencyCode}.
            </Text>
            <CurrencySelector monthlyTotalUsd={monthlyTotalUsd} />

            {ratesStatus === 'cached' ? (
              <View style={styles.cacheBanner}>
                <Text style={styles.cacheTitle}>Using saved rates</Text>
                <Text style={styles.cacheBody}>
                  Live FX is temporarily unavailable. Showing last saved rates from{' '}
                  {formatCachedRateLabel(ratesFetchedAt)}.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: '#0B0B0D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kicker: {
    color: DashboardColors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DashboardColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: DashboardColors.textSecondary,
    fontSize: 14,
  },
  content: {
    paddingBottom: 16,
    gap: 8,
  },
  hint: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  cacheBanner: {
    marginTop: 4,
    backgroundColor: DashboardColors.macroSoft,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    gap: 4,
  },
  cacheTitle: {
    color: DashboardColors.macro,
    fontSize: 13,
    fontWeight: '700',
  },
  cacheBody: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});
