import { Linking, StyleSheet, Text, View } from 'react-native';

import { StatePanel } from '@/components/ui/StatePanel';
import { DashboardColors } from '@/constants/dashboard';
import {
  usePreferences,
  type NotificationPermissionStatus,
} from '@/context/preferences-context';

type Props = {
  compact?: boolean;
};

function statusCopy(status: NotificationPermissionStatus) {
  switch (status) {
    case 'granted':
      return {
        title: 'Push alerts enabled',
        body: 'Renewals, trials, and unused-plan reminders can reach you on this device.',
      };
    case 'denied':
      return {
        title: 'Enable notifications',
        body: 'Alerts are off for this device. Turn them on in system Settings, then return here — we’ll sync automatically.',
      };
    default:
      return {
        title: 'Enable push notifications',
        body: 'Allow alerts for renewals, trial endings, and unused plans. You can change this anytime.',
      };
  }
}

export function NotificationPermissionCard({ compact = false }: Props) {
  const {
    notificationPermission,
    requestNotificationPermission,
    declineNotificationPermission,
    refreshNotificationPermission,
  } = usePreferences();
  const copy = statusCopy(notificationPermission);

  const openSettings = () => {
    void Linking.openSettings();
  };

  if (compact && notificationPermission === 'granted') {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <StatePanel
        tone={notificationPermission === 'granted' ? 'neutral' : 'warning'}
        title={copy.title}
        body={copy.body}
        ctaLabel={
          notificationPermission === 'denied'
            ? 'Open Settings'
            : notificationPermission === 'unknown'
              ? 'Enable alerts'
              : undefined
        }
        onCtaPress={
          notificationPermission === 'denied'
            ? openSettings
            : notificationPermission === 'unknown'
              ? () => {
                  void requestNotificationPermission();
                }
              : undefined
        }
        secondaryLabel={
          notificationPermission === 'unknown'
            ? 'Not now'
            : notificationPermission === 'denied'
              ? 'I already enabled them'
              : undefined
        }
        onSecondaryPress={
          notificationPermission === 'unknown'
            ? () => {
                void declineNotificationPermission();
              }
            : notificationPermission === 'denied'
              ? () => {
                  void refreshNotificationPermission();
                }
              : undefined
        }
      />
      {notificationPermission === 'granted' ? (
        <Text style={styles.skipHint} onPress={openSettings}>
          Manage in system Settings
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  skipHint: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
});
