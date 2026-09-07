import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CountryPickerModal } from '@/components/onboarding/CountryPickerModal';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { BRAND_NAME, OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

export default function CountryScreen() {
  const { draft, updateDraft } = useOnboarding();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <OnboardingShell
      footer={
        <>
          <Text style={styles.legal}>
            By pressing “Agree and continue”, you have read and agreed to the{' '}
            <Text style={styles.link}>{BRAND_NAME} Privacy Policy</Text> and the{' '}
            <Text style={styles.link}>Terms of Service</Text>.
          </Text>
          <PrimaryButton label="Accept and continue" onPress={() => router.push('/(onboarding)/name')} />
        </>
      }>
      <Text style={styles.title}>Country of residence</Text>
      <Text style={styles.subtitle}>
        The terms and services which apply to you will depend on your country of residence
      </Text>

      <Pressable style={styles.selector} onPress={() => setPickerOpen(true)}>
        <Text style={styles.selectorText}>{draft.residenceCountry.name}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <CountryPickerModal
        visible={pickerOpen}
        selectedCode={draft.residenceCountry.code}
        onClose={() => setPickerOpen(false)}
        onSelect={(country) => updateDraft({ residenceCountry: country })}
      />
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
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 28,
  },
  selector: {
    height: 56,
    borderRadius: 14,
    backgroundColor: OnboardingColors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OnboardingColors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    color: OnboardingColors.text,
    fontSize: 17,
  },
  chevron: {
    color: OnboardingColors.text,
    fontSize: 14,
  },
  legal: {
    color: OnboardingColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: OnboardingColors.link,
  },
});
