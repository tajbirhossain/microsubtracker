import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { DashboardColors } from '@/constants/dashboard';

function Bone({ style }: { style?: object }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.bone, style, animatedStyle]} />;
}

export function DashboardSkeleton() {
  return (
    <View style={styles.wrap} accessibilityLabel="Loading dashboard">
      <View style={styles.topBar}>
        <View style={styles.topCopy}>
          <Bone style={styles.greeting} />
          <Bone style={styles.brand} />
        </View>
        <Bone style={styles.avatar} />
      </View>

      <Bone style={styles.hero} />

      <View style={styles.scaleRow}>
        <Bone style={styles.scaleCard} />
        <Bone style={styles.scaleCard} />
      </View>

      <Bone style={styles.banner} />

      <View style={styles.listHeader}>
        <Bone style={styles.sectionLabel} />
        <Bone style={styles.count} />
      </View>

      <Bone style={styles.filter} />

      <View style={styles.list}>
        <Bone style={styles.row} />
        <Bone style={styles.row} />
        <Bone style={styles.row} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
    paddingBottom: 40,
  },
  bone: {
    backgroundColor: DashboardColors.surfaceMuted,
    borderRadius: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topCopy: {
    gap: 8,
  },
  greeting: {
    width: 88,
    height: 12,
    borderRadius: 6,
  },
  brand: {
    width: 168,
    height: 22,
    borderRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  hero: {
    height: 168,
    borderRadius: 24,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scaleCard: {
    flex: 1,
    height: 88,
    borderRadius: 16,
  },
  banner: {
    height: 64,
    borderRadius: 16,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    width: 140,
    height: 16,
    borderRadius: 8,
  },
  count: {
    width: 28,
    height: 14,
    borderRadius: 7,
  },
  filter: {
    height: 44,
    borderRadius: 14,
  },
  list: {
    gap: 10,
  },
  row: {
    height: 72,
    borderRadius: 16,
  },
});
