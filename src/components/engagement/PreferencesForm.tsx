import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CurrencySelector } from '@/components/engagement/CurrencySelector';
import { NotificationContentPrefs } from '@/components/engagement/NotificationContentPrefs';
import { NotificationPermissionCard } from '@/components/engagement/NotificationPermissionCard';
import { StatePanel } from '@/components/ui/StatePanel';
import { formatCachedRateLabel } from '@/constants/currency';
import { DashboardColors } from '@/constants/dashboard';
import { useOnboarding } from '@/context/onboarding-context';
import { usePreferences } from '@/context/preferences-context';

type Props = {
  monthlyTotalUsd: number;
};

export function PreferencesForm({ monthlyTotalUsd }: Props) {
  const { ratesStatus, currencyCode, notificationPermission } = usePreferences();
  const { user, signOut, isAuthenticated } = useOnboarding();
  const needsPermission =
    notificationPermission === 'unknown' || notificationPermission === 'denied';

  return (
    <View style={styles.wrap}>
      {isAuthenticated && user ? (
        <>
          <Text style={styles.sectionLabel}>Account</Text>
          <Text style={styles.sectionHint}>{user.email}</Text>
          <StatePanel
            title="Signed in"
            body="Sign out to switch accounts. Your subscription data stays on the server."
            ctaLabel="Sign out"
            onCtaPress={() => {
              void (async () => {
                await signOut();
                router.replace('/(onboarding)/welcome');
              })();
            }}
          />
        </>
      ) : null}

      {needsPermission ? (
        <>
          <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Notifications</Text>
          <Text style={styles.sectionHint}>
            Push alerts are off. Enable them so renewal and trial reminders can reach this device.
          </Text>
          <NotificationPermissionCard />
        </>
      ) : null}

      <Text style={styles.sectionLabel}>Display currency</Text>
      <Text style={styles.sectionHint}>
        Convert your burn rate into the currency you think in. Active: {currencyCode}.
      </Text>
      <CurrencySelector monthlyTotalUsd={monthlyTotalUsd} />

      {ratesStatus === 'cached' ? (
        <View style={styles.cacheBanner}>
          <Text style={styles.cacheTitle}>Using saved rates</Text>
          <Text style={styles.cacheBody}>
            Live FX is temporarily unavailable. Showing last saved rates from{' '}
            {formatCachedRateLabel()}.
          </Text>
        </View>
      ) : null}

      {!needsPermission ? (
        <>
          <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Push permission</Text>
          <Text style={styles.sectionHint}>
            When the system blocks alerts, open Settings to re-enable them on this device.
          </Text>
          <NotificationPermissionCard />
        </>
      ) : null}

      <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Notification content</Text>
      <NotificationContentPrefs />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  sectionLabel: {
    color: DashboardColors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  sectionSpaced: {
    marginTop: 20,
  },
  sectionHint: {
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
