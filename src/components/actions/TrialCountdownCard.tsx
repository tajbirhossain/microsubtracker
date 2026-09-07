import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ServiceLogo } from '@/components/ServiceLogo';
import { DashboardColors } from '@/constants/dashboard';
import type { TrialActionCard } from '@/types/cancellation';

type Props = {
  card: TrialActionCard;
  onCancelPress: () => void;
  onKeepPress?: () => void;
};

export function TrialCountdownCard({ card, onCancelPress, onKeepPress }: Props) {
  const { subscription, urgency, daysLeft, headline, subcopy, chargeAmountLabel } = card;
  const ringPct = Math.max(8, Math.min(100, ((7 - Math.min(daysLeft, 7)) / 7) * 100));

  return (
    <View
      style={[
        styles.card,
        urgency === 'critical' && styles.cardCritical,
        urgency === 'soon' && styles.cardSoon,
      ]}>
      <View style={styles.top}>
        <ServiceLogo
          name={subscription.name}
          providerKey={subscription.providerKey}
          fallbackIcon={subscription.icon}
          color={subscription.color}
          size={44}
        />
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Free trial</Text>
          <Text style={styles.name} numberOfLines={1}>
            {subscription.name}
          </Text>
          <Text style={styles.amount}>{chargeAmountLabel} after</Text>
        </View>
        <View style={styles.countdown}>
          <View style={styles.ringTrack}>
            <View style={[styles.ringFill, { width: `${ringPct}%` }]} />
          </View>
          <Text style={styles.daysNum}>{daysLeft}</Text>
          <Text style={styles.daysLabel}>{daysLeft === 1 ? 'day' : 'days'}</Text>
        </View>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.subcopy}>{subcopy}</Text>

      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={onCancelPress}>
          <Text style={styles.cancelText}>Cancel guide</Text>
        </Pressable>
        {onKeepPress ? (
          <Pressable style={styles.keepBtn} onPress={onKeepPress}>
            <Text style={styles.keepText}>Keep</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type RowProps = {
  cards: TrialActionCard[];
  onOpenGuide: (subscriptionId: string) => void;
  onKeep?: (subscriptionId: string) => void;
};

export function TrialCountdownRow({ cards, onOpenGuide, onKeep }: RowProps) {
  if (cards.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Trials ending soon</Text>
      <View style={styles.list}>
        {cards.map((card) => (
          <TrialCountdownCard
            key={card.subscription.id}
            card={card}
            onCancelPress={() => onOpenGuide(card.subscription.id)}
            onKeepPress={onKeep ? () => onKeep(card.subscription.id) : undefined}
          />
        ))}
      </View>
    </View>
  );
}

export async function openExternalCancelUrl(url?: string | null) {
  if (!url) return false;
  const can = await Linking.canOpenURL(url);
  if (!can) return false;
  await Linking.openURL(url);
  return true;
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: DashboardColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: DashboardColors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    gap: 8,
  },
  cardCritical: {
    backgroundColor: DashboardColors.dangerSoft,
    borderColor: 'rgba(255,69,58,0.35)',
  },
  cardSoon: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: 'rgba(91,158,255,0.3)',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: DashboardColors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    color: DashboardColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  amount: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
  },
  countdown: {
    width: 58,
    alignItems: 'center',
  },
  ringTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  ringFill: {
    height: '100%',
    backgroundColor: DashboardColors.danger,
    borderRadius: 2,
  },
  daysNum: {
    color: DashboardColors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  daysLabel: {
    color: DashboardColors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  headline: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  subcopy: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  keepBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 21,
    backgroundColor: DashboardColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  keepText: {
    color: DashboardColors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
