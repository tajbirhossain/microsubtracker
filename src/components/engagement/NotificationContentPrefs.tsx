import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  NOTIFICATION_CONTENT_OPTIONS,
  type NotificationContentId,
} from '@/constants/notification-content';
import { DashboardColors } from '@/constants/dashboard';
import { usePreferences } from '@/context/preferences-context';

type Props = {
  onToggle?: (id: NotificationContentId) => void;
};

export function NotificationContentPrefs({ onToggle }: Props) {
  const { notificationContentIds, toggleNotificationContent } = usePreferences();

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>
        Choose which local push contents you want. At least one stays on.
      </Text>
      {NOTIFICATION_CONTENT_OPTIONS.map((option) => {
        const active = notificationContentIds.includes(option.id);
        return (
          <Pressable
            key={option.id}
            onPress={() => {
              toggleNotificationContent(option.id);
              onToggle?.(option.id);
            }}
            style={[styles.row, active && styles.rowActive]}>
            <View style={styles.copy}>
              <Text style={styles.title}>{option.title}</Text>
              <Text style={styles.description}>{option.description}</Text>
              <Text style={styles.preview}>“{option.preview}”</Text>
            </View>
            <View style={[styles.toggle, active && styles.toggleOn]}>
              <View style={[styles.knob, active && styles.knobOn]} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  hint: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
  },
  rowActive: {
    borderColor: 'rgba(91,158,255,0.35)',
    backgroundColor: DashboardColors.accentSoft,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    color: DashboardColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  preview: {
    marginTop: 4,
    color: DashboardColors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  toggle: {
    width: 46,
    height: 28,
    borderRadius: 14,
    backgroundColor: DashboardColors.surfaceMuted,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: DashboardColors.accent,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});
