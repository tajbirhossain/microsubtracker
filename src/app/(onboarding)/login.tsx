import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackButton } from '@/components/onboarding/BackButton';
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

export default function LoginScreen() {
  const { draft, updateDraft } = useOnboarding();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const canContinue = draft.phoneNumber.replace(/\D/g, '').length >= 7;

  const onLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    router.push('/(onboarding)/verify-code');
  };

  return (
    <OnboardingShell
      footer={
        <PrimaryButton label="Log in" disabled={!canContinue} loading={loading} onPress={onLogin} />
      }>
      <BackButton />
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in with the phone number linked to your account</Text>

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
        </View>
      </View>

      <Pressable onPress={() => router.push('/(onboarding)/phone')} style={styles.linkWrap}>
        <Text style={styles.link}>New here? Create account</Text>
      </Pressable>

      <CountryPickerModal
        visible={pickerOpen}
        selectedCode={draft.phoneCountry.code}
        onClose={() => setPickerOpen(false)}
        onSelect={(country) => updateDraft({ phoneCountry: country })}
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
    justifyContent: 'center',
    backgroundColor: OnboardingColors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 56,
  },
  phoneInput: {
    color: OnboardingColors.text,
    fontSize: 16,
    padding: 0,
  },
  linkWrap: {
    marginTop: 18,
  },
  link: {
    color: OnboardingColors.link,
    fontSize: 15,
  },
});
