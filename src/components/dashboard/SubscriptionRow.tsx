import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ServiceLogo } from '@/components/ServiceLogo';
import { DashboardColors, type Subscription } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';
import { cycleLabel, daysUntil, formatShortDate } from '@/utils/subscriptions';

type Props = {
  subscription: Subscription;
  onPress?: () => void;
};

export function SubscriptionRow({ subscription, onPress }: Props) {
  const { formatInCurrency } = usePreferences();
  const dueIn = daysUntil(subscription.nextBillingDate);
  const dueLabel =
    dueIn === 0 ? 'Today' : dueIn === 1 ? 'Tomorrow' : dueIn < 0 ? 'Overdue' : `In ${dueIn}d`;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <ServiceLogo
        name={subscription.name}
        providerKey={subscription.providerKey}
        fallbackIcon={subscription.icon}
        color={subscription.color}
        size={44}
      />

      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {subscription.name}
          </Text>
          {subscription.scale === 'macro' ? (
            <View style={styles.macroBadge}>
              <Text style={styles.macroBadgeText}>Big</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.subline} numberOfLines={1}>
          {subscription.category} · {formatShortDate(subscription.nextBillingDate)} · {dueLabel}
        </Text>
        {subscription.isTrial ? (
          <Text style={styles.trial}>
            Trial ends in {subscription.trialEndsInDays} day
            {subscription.trialEndsInDays === 1 ? '' : 's'}
          </Text>
        ) : null}
        {subscription.unusedDays && subscription.unusedDays >= 30 ? (
          <Text style={styles.ghost}>Unused · {subscription.unusedDays}d quiet</Text>
        ) : null}
      </View>

      <View style={styles.amountCol}>
        <Text style={styles.amount}>{formatInCurrency(subscription.amount)}</Text>
        <Text style={styles.cycle}>{cycleLabel(subscription.billingCycle)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: DashboardColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  macroBadge: {
    backgroundColor: DashboardColors.macroSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  macroBadgeText: {
    color: DashboardColors.macro,
    fontSize: 10,
    fontWeight: '700',
  },
  subline: {
    color: DashboardColors.textMuted,
    fontSize: 12,
  },
  trial: {
    marginTop: 2,
    color: DashboardColors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  ghost: {
    marginTop: 2,
    color: DashboardColors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amount: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  cycle: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
