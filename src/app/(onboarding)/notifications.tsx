import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NotificationContentPrefs } from '@/components/engagement/NotificationContentPrefs';
import { BackButton } from '@/components/onboarding/BackButton';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';
import { usePreferences } from '@/context/preferences-context';

export default function NotificationsScreen() {
  const { updateDraft } = useOnboarding();
  const { requestNotificationPermission, declineNotificationPermission } = usePreferences();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const enable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const status = await requestNotificationPermission();
      updateDraft({ notificationsEnabled: status === 'granted' });
      router.push('/(onboarding)/country');
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await declineNotificationPermission();
      updateDraft({ notificationsEnabled: false });
      router.push('/(onboarding)/country');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingShell
      footer={
        <>
          <PrimaryButton
            label={busy ? 'Working…' : 'Enable push notifications'}
            onPress={() => {
              void enable();
            }}
          />
          <PrimaryButton
            label={customizeOpen ? 'Hide content options' : 'Choose alert contents'}
            variant="secondary"
            onPress={() => setCustomizeOpen((open) => !open)}
          />
          <PrimaryButton
            label="Not now"
            variant="secondary"
            onPress={() => {
              void skip();
            }}
          />
        </>
      }>
      <BackButton />
      <View style={styles.center}>
        <View style={styles.iconCard}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconMark}>◆</Text>
          </View>
        </View>
        <Text style={styles.title}>STAY AHEAD{'\n'}OF CHARGES</Text>
        <Text style={styles.copy}>
          Turn on push alerts for renewals, trial endings, and unused subscriptions. If you skip,
          you can enable them later from Preferences.
        </Text>
      </View>

      {customizeOpen ? (
        <View style={styles.prefs}>
          <NotificationContentPrefs />
        </View>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 16,
  },
  iconCard: {
    width: 88,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 28,
    justifyContent: 'center',
    paddingLeft: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: OnboardingColors.link,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: OnboardingColors.text,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
  },
  copy: {
    color: OnboardingColors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    maxWidth: 300,
  },
  prefs: {
    marginTop: 8,
    marginBottom: 12,
  },
});
