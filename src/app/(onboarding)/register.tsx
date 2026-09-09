import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/onboarding/BackButton';
import { ConfirmEmailModal } from '@/components/onboarding/ConfirmModals';
import { OnboardingInput } from '@/components/onboarding/OnboardingInput';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

export default function RegisterScreen() {
  const { draft, updateDraft, setAuthMode, submitCredentials } = useOnboarding();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpHint, setOtpHint] = useState<string | undefined>();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim());
  const passwordOk = draft.password.length >= 8;
  const canContinue = emailOk && passwordOk;

  const onCreate = () => {
    setAuthMode('signup');
    setError(null);
    setConfirmOpen(true);
  };

  const onConfirmEmail = async () => {
    setLoading(true);
    setError(null);
    const result = await submitCredentials();
    setLoading(false);
    if (!result.ok) {
      setConfirmOpen(false);
      setError(result.error ?? 'Unable to create account');
      return;
    }
    setOtpHint(result.otpHint);
    setConfirmOpen(false);
    router.push('/(onboarding)/verify-code');
  };

  return (
    <OnboardingShell
      footer={
        <PrimaryButton
          label="Create account"
          disabled={!canContinue}
          loading={loading}
          onPress={onCreate}
        />
      }>
      <BackButton />
      <Text style={styles.title}>Let&apos;s get started!</Text>
      <Text style={styles.subtitle}>
        Enter your email and a password. We&apos;ll send a confirmation code to verify your account.
      </Text>

      <View style={styles.fields}>
        <OnboardingInput
          floatingLabel="Email"
          value={draft.email}
          onChangeText={(text) => updateDraft({ email: text })}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
        <OnboardingInput
          floatingLabel="Password"
          value={draft.password}
          onChangeText={(text) => updateDraft({ password: text })}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={() => {
          setAuthMode('login');
          router.push('/(onboarding)/login');
        }}
        style={styles.loginLink}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginAccent}>Log in</Text>
        </Text>
      </Pressable>

      <ConfirmEmailModal
        visible={confirmOpen}
        email={draft.email.trim().toLowerCase()}
        otpHint={otpHint}
        onGoBack={() => setConfirmOpen(false)}
        onConfirm={onConfirmEmail}
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: OnboardingColors.text,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    color: OnboardingColors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 28,
  },
  fields: {
    gap: 12,
  },
  error: {
    color: OnboardingColors.error,
    marginTop: 12,
    fontSize: 14,
  },
  loginLink: {
    marginTop: 18,
  },
  loginText: {
    color: OnboardingColors.link,
    fontSize: 15,
  },
  loginAccent: {
    fontWeight: '600',
  },
});
