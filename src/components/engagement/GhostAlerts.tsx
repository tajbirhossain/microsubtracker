import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ServiceLogo } from '@/components/ServiceLogo';
import { DashboardColors, type Subscription } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';
import { toMonthlyUsd } from '@/utils/subscriptions';

type Props = {
  subscriptions: Subscription[];
  onOpenGuide: (subscriptionId: string) => void;
};

export function GhostAlerts({ subscriptions, onOpenGuide }: Props) {
  const { dismissedGhostIds, dismissGhost, formatInCurrency, rates } = usePreferences();

  const ghosts = subscriptions.filter(
    (sub) => (sub.unusedDays ?? 0) >= 30 && !dismissedGhostIds.includes(sub.id)
  );

  if (ghosts.length === 0) return null;

  const quietMonthly = ghosts.reduce((sum, sub) => sum + toMonthlyUsd(sub, rates), 0);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>Barely used</Text>
        <Text style={styles.savings}>~{formatInCurrency(quietMonthly, true)}/mo sitting quiet</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {ghosts.map((alert) => {
          const monthly = toMonthlyUsd(alert, rates);
          return (
            <View key={alert.id} style={styles.card}>
              <View style={styles.top}>
                <ServiceLogo
                  name={alert.name}
                  providerKey={alert.providerKey}
                  fallbackIcon={alert.icon}
                  color={alert.color}
                  size={40}
                  radius={12}
                />
                <View style={styles.copy}>
                  <Text style={styles.eyebrow}>Quiet lately</Text>
                  <Text style={styles.title} numberOfLines={1}>
                    {alert.name}
                  </Text>
                </View>
              </View>

              <Text style={styles.body}>
                Quiet for {alert.unusedDays} days · {formatInCurrency(monthly)}/mo
              </Text>

              <View style={styles.actions}>
                <Pressable style={styles.primaryBtn} onPress={() => onOpenGuide(alert.id)}>
                  <Text style={styles.primaryText}>Cancel guide</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={() => dismissGhost(alert.id)}>
                  <Text style={styles.secondaryText}>Dismiss</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionLabel: {
    color: DashboardColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  savings: {
    color: DashboardColors.danger,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  row: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 260,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    backgroundColor: DashboardColors.dangerSoft,
    borderColor: 'rgba(255,69,58,0.35)',
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: DashboardColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  secondaryText: {
    color: DashboardColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
