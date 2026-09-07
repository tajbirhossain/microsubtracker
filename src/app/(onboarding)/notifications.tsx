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
  const { setNotificationPermission } = usePreferences();
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const enable = () => {
    updateDraft({ notificationsEnabled: true });
    setNotificationPermission('granted');
    router.push('/(onboarding)/country');
  };

  const skip = () => {
    updateDraft({ notificationsEnabled: false });
    setNotificationPermission('denied');
    router.push('/(onboarding)/country');
  };

  return (
    <OnboardingShell
      footer={
        <>
          <PrimaryButton label="Enable push notifications" onPress={enable} />
          <PrimaryButton
            label={customizeOpen ? 'Hide content options' : 'Choose alert contents'}
            variant="secondary"
            onPress={() => setCustomizeOpen((open) => !open)}
          />
          <PrimaryButton label="Not now" variant="secondary" onPress={skip} />
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
          Customize local push alerts for renewals, trial endings, and unused subscriptions. If you
          skip, you can still allow them later from Settings.
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
