import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { InterestPill } from '@/components/onboarding/InterestPill';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { INTEREST_SECTIONS, OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

export default function InterestsScreen() {
  const { draft, updateDraft } = useOnboarding();
  const selected = new Set(draft.interests);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateDraft({ interests: Array.from(next) });
  };

  return (
    <OnboardingShell
      footer={
        <PrimaryButton
          label="Continue"
          disabled={draft.interests.length === 0}
          onPress={() => router.push('/(onboarding)/profile')}
        />
      }>
      <Text style={styles.title}>What do you want help with?</Text>
      <Text style={styles.subtitle}>
        Pick the goals that matter — we&apos;ll shape your setup around them
      </Text>

      {INTEREST_SECTIONS.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.pills}>
            {section.options.map((option) => (
              <InterestPill
                key={option.id}
                icon={option.icon}
                label={option.label}
                selected={selected.has(option.id)}
                onPress={() => toggle(option.id)}
              />
            ))}
          </View>
        </View>
      ))}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: OnboardingColors.text,
    fontSize: 30,
    fontWeight: '700',
    marginTop: 24,
    lineHeight: 36,
  },
  subtitle: {
    color: OnboardingColors.textSecondary,
    fontSize: 15,
    marginTop: 10,
    marginBottom: 28,
    lineHeight: 22,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: OnboardingColors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
