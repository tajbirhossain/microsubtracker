import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DashboardColors } from '@/constants/dashboard';
import { useNetwork } from '@/context/network-context';
import { useSubscriptions } from '@/context/subscriptions-context';

type Props = {
  onPressSync?: () => void;
};

export function OfflineBanner({ onPressSync }: Props) {
  const { isOnline, isHydrated } = useNetwork();
  const { isSyncing, pendingCount } = useSubscriptions();

  if (!isHydrated) return null;

  if (!isOnline) {
    return (
      <View style={[styles.banner, styles.offline]}>
        <Text style={styles.title}>You’re offline</Text>
        <Text style={styles.body}>Changes save on this device and sync when you’re back online.</Text>
        {pendingCount > 0 ? (
          <Text style={styles.meta}>Pending sync · {pendingCount} change{pendingCount === 1 ? '' : 's'}</Text>
        ) : null}
      </View>
    );
  }

  if (isSyncing) {
    return (
      <Pressable style={[styles.banner, styles.syncing]} onPress={onPressSync}>
        <Text style={styles.title}>Syncing {pendingCount || ''} change{(pendingCount || 0) === 1 ? '' : 's'}…</Text>
        <Text style={styles.body}>Pushing local edits to the cloud.</Text>
      </Pressable>
    );
  }

  if (pendingCount > 0) {
    return (
      <Pressable style={[styles.banner, styles.pending]} onPress={onPressSync}>
        <Text style={styles.title}>Pending sync · {pendingCount}</Text>
        <Text style={styles.body}>Tap to retry syncing your offline changes.</Text>
      </Pressable>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 2,
  },
  offline: {
    backgroundColor: DashboardColors.macroSoft,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  syncing: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: 'rgba(91,158,255,0.35)',
  },
  pending: {
    backgroundColor: DashboardColors.accentSoft,
    borderColor: 'rgba(91,158,255,0.35)',
  },
  title: {
    color: DashboardColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    marginTop: 4,
    color: DashboardColors.macro,
    fontSize: 11,
    fontWeight: '600',
  },
});
