import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/engagement/OfflineBanner';
import { PreferencesForm } from '@/components/engagement/PreferencesForm';
import { DashboardColors } from '@/constants/dashboard';
import { BottomTabInset } from '@/constants/theme';
import { useSubscriptions } from '@/context/subscriptions-context';
import { sumMonthly } from '@/utils/subscriptions';

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const { activeSubscriptions, syncNow } = useSubscriptions();
  const monthlyTotalUsd = sumMonthly(activeSubscriptions);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[DashboardColors.backgroundTop, DashboardColors.backgroundMid, DashboardColors.background]}
        locations={[0, 0.28, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + BottomTabInset + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Settings</Text>
          <Text style={styles.title}>Preferences</Text>
          <Text style={styles.subtitle}>
            Currency, push alerts, and demo data for how Micro Sub Tracker behaves on this device.
          </Text>
        </View>

        <OfflineBanner onPressSync={() => void syncNow()} />

        <PreferencesForm monthlyTotalUsd={monthlyTotalUsd} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    gap: 6,
    paddingBottom: 4,
  },
  eyebrow: {
    color: DashboardColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: DashboardColors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: DashboardColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 340,
  },
});
