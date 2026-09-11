import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { BrandColors } from '@/constants/brand';

const FADE_MS = 450;
const MAX_SPLASH_MS = 2500;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const started = useRef(false);
  const done = useRef(false);
  const opacity = useSharedValue(1);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setVisible(false);
  };

  const startExit = () => {
    if (started.current) return;
    started.current = true;

    void SplashScreen.hideAsync().catch(() => undefined);

    opacity.value = withTiming(
      0,
      { duration: FADE_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(finish)();
        }
      }
    );

    setTimeout(() => {
      finish();
    }, FADE_MS + 400);
  };

  useEffect(() => {
    const boot = setTimeout(startExit, 350);
    const forceHide = setTimeout(() => {
      void SplashScreen.hideAsync().catch(() => undefined);
      finish();
    }, MAX_SPLASH_MS);

    return () => {
      clearTimeout(boot);
      clearTimeout(forceHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only splash boot
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.splashOverlay, animatedStyle]} pointerEvents="none">
      <Image
        style={styles.image}
        source={require('@/assets/images/app-logo.png')}
        contentFit="contain"
      />
    </Animated.View>
  );
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Image
        style={styles.heroLogo}
        source={require('@/assets/images/app-logo.png')}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 120,
    height: 120,
  },
  heroLogo: {
    width: 128,
    height: 128,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BrandColors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
