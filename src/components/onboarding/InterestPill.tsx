import { Pressable, StyleSheet, Text } from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

type Props = {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function InterestPill({ icon, label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: OnboardingColors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 8,
    marginBottom: 10,
  },
  pillSelected: {
    backgroundColor: OnboardingColors.primaryButton,
  },
  icon: {
    fontSize: 15,
  },
  label: {
    color: OnboardingColors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  labelSelected: {
    color: OnboardingColors.primaryButtonText,
  },
});
