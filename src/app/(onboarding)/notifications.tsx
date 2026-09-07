import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/onboarding/BackButton';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

export default function NotificationsScreen() {
  const { updateDraft } = useOnboarding();

  const enable = () => {
    updateDraft({ notificationsEnabled: true });
    router.push('/(onboarding)/country');
  };

  const skip = () => {
    updateDraft({ notificationsEnabled: false });
    router.push('/(onboarding)/country');
  };

  return (
    <OnboardingShell
      footer={
        <>
          <PrimaryButton label="Enable push notifications" onPress={enable} />
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
          Customize local push alerts for renewals, trial endings, and unused subscriptions
        </Text>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 40,
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
});
