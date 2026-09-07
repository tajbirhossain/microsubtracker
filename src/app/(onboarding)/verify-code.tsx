import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { BackButton } from '@/components/onboarding/BackButton';
import { ErrorSheet } from '@/components/onboarding/ConfirmModals';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { OtpInput } from '@/components/onboarding/OtpInput';
import { OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

export default function VerifyCodeScreen() {
  const { draft, verifyCode, resendCode } = useOnboarding();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(15);
  const [errorOpen, setErrorOpen] = useState(false);

  const masked = draft.phoneNumber.replace(/\D/g, '').slice(-4) || '····';

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    if (code.length !== 6) return;
    let cancelled = false;
    (async () => {
      const result = await verifyCode(code);
      if (cancelled) return;
      if (result.ok) {
        router.push('/(onboarding)/notifications');
      } else {
        setErrorOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, verifyCode]);

  const onResend = async () => {
    if (seconds > 0) return;
    await resendCode();
    setSeconds(15);
    setCode('');
  };

  return (
    <OnboardingShell>
      <BackButton />
      <Text style={styles.title}>6-digit code</Text>
      <Text style={styles.subtitle}>
        Enter the code sent to {draft.phoneCountry.dialCode} ···· {masked}
      </Text>

      <OtpInput value={code} onChange={setCode} />

      {seconds > 0 ? (
        <Text style={styles.timer}>Resend code in 00:{String(seconds).padStart(2, '0')}</Text>
      ) : (
        <Pressable onPress={onResend}>
          <Text style={styles.resend}>No code received?</Text>
        </Pressable>
      )}

      <ErrorSheet
        visible={errorOpen}
        title="Incorrect code entered"
        message="Please check the code and try again"
        onDismiss={() => {
          setErrorOpen(false);
          setCode('');
        }}
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
    marginTop: 8,
  },
  timer: {
    color: OnboardingColors.text,
    fontSize: 15,
    marginTop: 20,
  },
  resend: {
    color: OnboardingColors.link,
    fontSize: 15,
    marginTop: 20,
  },
});
