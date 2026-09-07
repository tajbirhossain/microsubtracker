import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackButton } from '@/components/onboarding/BackButton';
import { ConfirmPhoneModal } from '@/components/onboarding/ConfirmModals';
import { CountryPickerModal } from '@/components/onboarding/CountryPickerModal';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function PhoneScreen() {
  const { draft, updateDraft, submitPhone } = useOnboarding();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const digits = draft.phoneNumber.replace(/\D/g, '');
  const canContinue = digits.length >= 7;

  const onCreate = async () => {
    setLoading(true);
    const result = await submitPhone();
    setLoading(false);
    if (result.ok) setConfirmOpen(true);
  };

  const phoneDisplay = `${draft.phoneCountry.dialCode} ${draft.phoneNumber}`.trim();

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
      <Text style={styles.subtitle}>Enter your phone number. We will send you a confirmation code there</Text>

      <View style={styles.phoneRow}>
        <Pressable style={styles.countryBox} onPress={() => setPickerOpen(true)}>
          <Text style={styles.flag}>{draft.phoneCountry.flag}</Text>
          <Text style={styles.dial}>{draft.phoneCountry.dialCode}</Text>
        </Pressable>
        <View style={styles.phoneBox}>
          <TextInput
            value={draft.phoneNumber}
            onChangeText={(text) => updateDraft({ phoneNumber: formatPhone(text) })}
            placeholder="Enter your phone"
            placeholderTextColor={OnboardingColors.textMuted}
            keyboardType="phone-pad"
            style={styles.phoneInput}
          />
          {draft.phoneNumber ? (
            <Pressable onPress={() => updateDraft({ phoneNumber: '' })} hitSlop={8}>
              <Text style={styles.clear}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Pressable onPress={() => router.push('/(onboarding)/login')} style={styles.loginLink}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginAccent}>Log in</Text>
        </Text>
      </Pressable>

      <CountryPickerModal
        visible={pickerOpen}
        selectedCode={draft.phoneCountry.code}
        onClose={() => setPickerOpen(false)}
        onSelect={(country) => updateDraft({ phoneCountry: country })}
      />

      <ConfirmPhoneModal
        visible={confirmOpen}
        flag={draft.phoneCountry.flag}
        phoneDisplay={phoneDisplay}
        onGoBack={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          router.push('/(onboarding)/verify-code');
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
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 28,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: OnboardingColors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 56,
  },
  flag: {
    fontSize: 20,
  },
  dial: {
    color: OnboardingColors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  phoneBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OnboardingColors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 56,
  },
  phoneInput: {
    flex: 1,
    color: OnboardingColors.text,
    fontSize: 16,
    padding: 0,
  },
  clear: {
    color: OnboardingColors.textMuted,
    fontSize: 14,
    paddingLeft: 8,
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
