import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

type Props = {
  count: number;
  activeIndex: number;
};

export function ProgressSegments({ count, activeIndex }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.segment, i === activeIndex ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
}

type SkipProps = {
  label?: string;
  onPress: () => void;
};

export function SkipLink({ label = 'Not now', onPress }: SkipProps) {
  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <Text style={styles.skip}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  active: {
    backgroundColor: OnboardingColors.progressActive,
  },
  inactive: {
    backgroundColor: OnboardingColors.progressInactive,
  },
  skip: {
    color: OnboardingColors.link,
    fontSize: 16,
    fontWeight: '500',
  },
});
