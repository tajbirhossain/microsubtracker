import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DashboardColors, type SpendScale } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';

type ScaleFilter = SpendScale | 'all';

type Props = {
  microTotal: number;
  macroTotal: number;
  microCount: number;
  macroCount: number;
  selected: ScaleFilter;
  onSelect: (scale: ScaleFilter) => void;
  periodLabel: string;
};

export function ScaleBreakdown({
  microTotal,
  macroTotal,
  microCount,
  macroCount,
  selected,
  onSelect,
  periodLabel,
}: Props) {
  const { formatInCurrency } = usePreferences();
  const total = Math.max(microTotal + macroTotal, 0.01);
  const microPct = Math.round((microTotal / total) * 100);
  const macroPct = 100 - microPct;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Where it goes</Text>
        <Text style={styles.hint}>{periodLabel}</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barMicro, { flex: Math.max(microPct, 4) }]} />
        <View style={[styles.barMacro, { flex: Math.max(macroPct, 4) }]} />
      </View>

      <View style={styles.row}>
        <ScaleCard
          label="Small plans"
          caption="Everyday apps"
          amountLabel={formatInCurrency(microTotal)}
          count={microCount}
          accent={DashboardColors.micro}
          soft={DashboardColors.microSoft}
          active={selected === 'micro'}
          onPress={() => onSelect(selected === 'micro' ? 'all' : 'micro')}
        />
        <ScaleCard
          label="Big plans"
          caption="The heavy ones"
          amountLabel={formatInCurrency(macroTotal)}
          count={macroCount}
          accent={DashboardColors.macro}
          soft={DashboardColors.macroSoft}
          active={selected === 'macro'}
          onPress={() => onSelect(selected === 'macro' ? 'all' : 'macro')}
        />
      </View>
    </View>
  );
}

function ScaleCard({
  label,
  caption,
  amountLabel,
  count,
  accent,
  soft,
  active,
  onPress,
}: {
  label: string;
  caption: string;
  amountLabel: string;
  count: number;
  accent: string;
  soft: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.scaleCard, active && { borderColor: accent, backgroundColor: soft }]}>
      <View style={styles.scaleTop}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={styles.scaleLabel}>{label}</Text>
      </View>
      <Text style={styles.scaleAmount}>{amountLabel}</Text>
      <Text style={styles.scaleMeta}>
        {count} plan{count === 1 ? '' : 's'} · {caption}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: DashboardColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    color: DashboardColors.textMuted,
    fontSize: 13,
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 3,
    backgroundColor: DashboardColors.chartTrack,
  },
  barMicro: {
    backgroundColor: DashboardColors.micro,
    borderRadius: 999,
  },
  barMacro: {
    backgroundColor: DashboardColors.macro,
    borderRadius: 999,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  scaleCard: {
    flex: 1,
    backgroundColor: DashboardColors.surfaceElevated,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    gap: 4,
  },
  scaleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scaleLabel: {
    color: DashboardColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  scaleAmount: {
    color: DashboardColors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  scaleMeta: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});
