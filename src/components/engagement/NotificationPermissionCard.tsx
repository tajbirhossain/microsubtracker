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
        title: 'Notifications blocked',
        body: 'Alerts stay off until you allow them in system Settings. Local content prefs still apply once permission returns.',
      };
    default:
      return {
        title: 'Push alerts not set',
        body: 'Enable local pushes for renewals and trial endings, or leave them off and track from the dashboard.',
      };
  }
}

export function NotificationPermissionCard({ compact = false }: Props) {
  const { notificationPermission, setNotificationPermission } = usePreferences();
  const copy = statusCopy(notificationPermission);

  const openSettings = () => {
    void Linking.openSettings();
  };

  if (compact && notificationPermission !== 'denied') {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <StatePanel
        tone={notificationPermission === 'denied' ? 'warning' : 'neutral'}
        title={copy.title}
        body={copy.body}
        ctaLabel={notificationPermission === 'denied' ? 'Open Settings' : undefined}
        onCtaPress={notificationPermission === 'denied' ? openSettings : undefined}
        secondaryLabel={
          notificationPermission === 'denied'
            ? 'Simulate allow (demo)'
            : notificationPermission === 'granted'
              ? 'Simulate deny (demo)'
              : 'Enable for this device'
        }
        onSecondaryPress={() => {
          if (notificationPermission === 'denied') {
            setNotificationPermission('granted');
            return;
          }
          if (notificationPermission === 'granted') {
            setNotificationPermission('denied');
            return;
          }
          setNotificationPermission('granted');
        }}
      />
      {notificationPermission === 'unknown' ? (
        <Text style={styles.skipHint} onPress={() => setNotificationPermission('denied')}>
          Keep alerts off
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
