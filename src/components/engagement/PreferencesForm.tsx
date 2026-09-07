import { StyleSheet, Text, View } from 'react-native';

import { CurrencySelector } from '@/components/engagement/CurrencySelector';
import { NotificationContentPrefs } from '@/components/engagement/NotificationContentPrefs';
import { NotificationPermissionCard } from '@/components/engagement/NotificationPermissionCard';
import { StatePanel } from '@/components/ui/StatePanel';
import { formatCachedRateLabel } from '@/constants/currency';
import { DashboardColors } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';
import { useSubscriptions } from '@/context/subscriptions-context';

type Props = {
  monthlyTotalUsd: number;
  showDemoData?: boolean;
};

export function PreferencesForm({ monthlyTotalUsd, showDemoData = true }: Props) {
  const { ratesStatus, currencyCode } = usePreferences();
  const { activeSubscriptions, clearDemoData, loadDemoData } = useSubscriptions();
  const hasSubs = activeSubscriptions.length > 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Display currency</Text>
      <Text style={styles.sectionHint}>
        Convert your burn rate into the currency you think in. Active: {currencyCode}.
      </Text>
      <CurrencySelector monthlyTotalUsd={monthlyTotalUsd} />

      {ratesStatus === 'cached' ? (
        <View style={styles.cacheBanner}>
          <Text style={styles.cacheTitle}>Cached conversion rates</Text>
          <Text style={styles.cacheBody}>
            Live FX unavailable — showing last saved rates from {formatCachedRateLabel()}.
          </Text>
        </View>
      ) : null}

      <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Push permission</Text>
      <Text style={styles.sectionHint}>
        When the system blocks alerts, open Settings to re-enable them on this device.
      </Text>
      <NotificationPermissionCard />

      <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Notification content</Text>
      <NotificationContentPrefs />

      {showDemoData ? (
        <>
          <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Demo data</Text>
          <Text style={styles.sectionHint}>
            Clear the seeded list to preview the empty dashboard, or restore the sample plans.
          </Text>
          <StatePanel
            title={hasSubs ? 'Sample subscriptions loaded' : 'No subscriptions stored'}
            body={
              hasSubs
                ? 'Clearing keeps offline edits local — useful for testing empty and loading states.'
                : 'Load the recruiter demo set to restore burn rate, trials, and ghost alerts.'
            }
            ctaLabel={hasSubs ? 'Clear demo data' : 'Load demo data'}
            onCtaPress={() => {
              if (hasSubs) {
                void clearDemoData();
                return;
              }
              void loadDemoData();
            }}
          />
        </>
      ) : null}
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
