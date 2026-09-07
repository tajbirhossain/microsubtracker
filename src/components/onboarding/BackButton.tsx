import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

type Props = {
  onPress?: () => void;
};

export function BackButton({ onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      onPress={onPress ?? (() => router.back())}
      style={styles.button}>
      <Text style={styles.chevron}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  chevron: {
    color: OnboardingColors.text,
    fontSize: 36,
    lineHeight: 36,
    fontWeight: '300',
  },
});
