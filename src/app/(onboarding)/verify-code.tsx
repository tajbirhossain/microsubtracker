import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/onboarding/BackButton';
import { ErrorSheet } from '@/components/onboarding/ConfirmModals';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { OtpInput } from '@/components/onboarding/OtpInput';
import { OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

export default function VerifyCodeScreen() {
  const { draft, authMode, verifyCode, resendCode, completeOnboarding, lastOtpHint } =
    useOnboarding();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(15);
  const [verifying, setVerifying] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Please check the code and try again');
  const lastTriedCode = useRef<string | null>(null);
  const verifyCodeRef = useRef(verifyCode);
  const completeOnboardingRef = useRef(completeOnboarding);

  verifyCodeRef.current = verifyCode;
  completeOnboardingRef.current = completeOnboarding;

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    if (code.length !== 6) return;
    if (lastTriedCode.current === code) return;
    lastTriedCode.current = code;
    setVerifying(true);

    void (async () => {
      const result = await verifyCodeRef.current(code);

      if (result.ok) {
        if (authMode === 'login') {
          await completeOnboardingRef.current();
          router.replace('/(tabs)/home');
        } else {
          router.push('/(onboarding)/notifications');
        }
        return;
      }

      setVerifying(false);
      setErrorMessage(result.error ?? 'Please check the code and try again');
      setErrorOpen(true);
    })();
  }, [code, authMode]);

  const onResend = async () => {
    if (seconds > 0 || verifying) return;
    await resendCode();
    setSeconds(15);
    setCode('');
    lastTriedCode.current = null;
  };

  return (
    <OnboardingShell>
      <BackButton />
      <Text style={styles.title}>{authMode === 'login' ? 'Welcome back' : '6-digit code'}</Text>
      <Text style={styles.subtitle}>
        Enter the code we sent to {draft.email.trim().toLowerCase() || 'your email'}
      </Text>
      {lastOtpHint ? <Text style={styles.devHint}>Dev OTP: {lastOtpHint}</Text> : null}

      <OtpInput value={code} onChange={setCode} />

      {verifying ? (
        <View style={styles.verifyingRow}>
          <ActivityIndicator color={OnboardingColors.link} />
          <Text style={styles.verifyingText}>Verifying code…</Text>
        </View>
      ) : seconds > 0 ? (
        <Text style={styles.timer}>Resend code in 00:{String(seconds).padStart(2, '0')}</Text>
      ) : (
        <Pressable onPress={onResend}>
          <Text style={styles.resend}>No code received?</Text>
        </Pressable>
      )}

      <ErrorSheet
        visible={errorOpen}
        title="Incorrect code entered"
        message={errorMessage}
        onDismiss={() => {
          setErrorOpen(false);
          setCode('');
          lastTriedCode.current = null;
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
  devHint: {
    color: OnboardingColors.link,
    fontSize: 14,
    marginTop: 10,
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  verifyingText: {
    color: OnboardingColors.link,
    fontSize: 15,
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
