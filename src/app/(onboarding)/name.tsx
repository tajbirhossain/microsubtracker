import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingInput } from '@/components/onboarding/OnboardingInput';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

export default function NameScreen() {
  const { draft, updateDraft } = useOnboarding();
  const canContinue = draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0;

  return (
    <OnboardingShell
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/(onboarding)/interests')}
        />
      }>
      <Text style={styles.title}>What&apos;s your name?</Text>
      <Text style={styles.subtitle}>This is how we&apos;ll greet you in the app</Text>

      <View style={styles.form}>
        <OnboardingInput
          value={draft.firstName}
          onChangeText={(firstName) => updateDraft({ firstName })}
          placeholder="First name"
          autoCapitalize="words"
          hint="e.g. Daniel, not 'Dan'"
        />
        <OnboardingInput
          value={draft.lastName}
          onChangeText={(lastName) => updateDraft({ lastName })}
          placeholder="Last name"
          autoCapitalize="words"
        />
        <OnboardingInput
          value={draft.alias}
          onChangeText={(alias) => updateDraft({ alias })}
          placeholder="Alias"
          autoCapitalize="words"
          hint="Optional"
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: OnboardingColors.text,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 24,
  },
  subtitle: {
    color: OnboardingColors.textSecondary,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 28,
  },
  form: {
    gap: 14,
  },
});
