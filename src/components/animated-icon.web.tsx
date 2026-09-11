import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

const DURATION = 300;

export function AnimatedSplashOverlay() {
  return null;
}

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.85 }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.out(Easing.cubic),
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={logoKeyframe.duration(DURATION)}>
        <Image
          style={styles.image}
          source={require('@/assets/images/app-logo.png')}
          contentFit="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
  },
  image: {
    width: 128,
    height: 128,
    borderRadius: 32,
  },
});
