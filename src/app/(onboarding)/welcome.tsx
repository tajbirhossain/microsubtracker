import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  FadeInUp,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ProgressSegments } from '@/components/onboarding/ProgressSegments';
import { BRAND_NAME, OnboardingColors, WELCOME_SLIDES, type WelcomeSlide } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function WelcomeVisual({
  visual,
  theme,
  active,
}: {
  visual: WelcomeSlide['visual'];
  theme: WelcomeSlide['theme'];
  active: boolean;
}) {
  const isLight = theme === 'light';
  const float = useSharedValue(0);
  const pulse = useSharedValue(1);
  const enter = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [float, pulse]);

  useEffect(() => {
    if (active) {
      enter.value = 0;
      enter.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    }
  }, [active, enter, visual]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value },
      { scale: 0.92 + enter.value * 0.08 },
    ],
    opacity: 0.55 + enter.value * 0.45,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { translateY: float.value * 0.6 }],
    opacity: 0.35 + enter.value * 0.45,
  }));

  return (
    <View style={styles.visualWrap}>
      <Animated.View style={[styles.orbRing, isLight && styles.orbRingLight, ringStyle]} />
      <Animated.View style={[styles.orb, isLight ? styles.orbLight : styles.orbDark, orbStyle]}>
        <Text style={[styles.orbMark, isLight && styles.orbMarkDark]}>
          {visual === 'control' ? '◎' : visual === 'track' ? '☰' : '⏱'}
        </Text>
      </Animated.View>
    </View>
  );
}

function SlideItem({
  item,
  index,
  scrollX,
  activeIndex,
}: {
  item: WelcomeSlide;
  index: number;
  scrollX: SharedValue<number>;
  activeIndex: number;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      opacity: interpolate(scrollX.value, input, [0.35, 1, 0.35], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(scrollX.value, input, [28, 0, 28], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollX.value, input, [0.94, 1, 0.94], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.slide, { width }, style]}>
      <Text style={[styles.headline, item.theme === 'light' && styles.textDark]}>{item.headline}</Text>
      {item.subtitle ? (
        <Text style={[styles.subtitle, item.theme === 'light' && styles.subtitleDark]}>{item.subtitle}</Text>
      ) : (
        <View style={styles.subtitleSpacer} />
      )}
      <WelcomeVisual visual={item.visual} theme={item.theme} active={activeIndex === index} />
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const [index, setIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const themeProgress = useSharedValue(WELCOME_SLIDES[0].theme === 'light' ? 1 : 0);
  const slide = WELCOME_SLIDES[index];
  const isLight = slide.theme === 'light';
  const { setAuthMode } = useOnboarding();

  useEffect(() => {
    themeProgress.value = withTiming(isLight ? 1 : 0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [isLight, themeProgress]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const syncIndex = (offsetX: number) => {
    const next = Math.round(offsetX / width);
    if (next !== index && next >= 0 && next < WELCOME_SLIDES.length) {
      setIndex(next);
    }
  };

  const rootStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(themeProgress.value, [0, 1], ['#000000', '#FFFFFF']),
  }));

  const brandStyle = useAnimatedStyle(() => ({
    color: interpolateColor(themeProgress.value, [0, 1], ['#FFFFFF', '#000000']),
  }));

  const createBtnStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(themeProgress.value, [0, 1], ['#FFFFFF', '#000000']),
    borderColor: interpolateColor(themeProgress.value, [0, 1], ['#FFFFFF', '#000000']),
    transform: [
      {
        scale: interpolate(themeProgress.value, [0, 0.5, 1], [1, 0.985, 1]),
      },
    ],
  }));

  const createLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(themeProgress.value, [0, 1], ['#000000', '#FFFFFF']),
  }));

  const loginBtnStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(themeProgress.value, [0, 1], ['#2C2C2E', '#F0F2F5']),
    borderColor: interpolateColor(themeProgress.value, [0, 1], ['#2C2C2E', '#D0D0D5']),
    borderWidth: 1,
  }));

  const loginLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(themeProgress.value, [0, 1], ['#FFFFFF', '#111111']),
  }));

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      <Animated.View entering={FadeInDown.duration(450).delay(80)} style={styles.top}>
        <ProgressSegments
          count={WELCOME_SLIDES.length}
          activeIndex={index}
          theme={isLight ? 'light' : 'dark'}
        />
        <Animated.Text style={[styles.brandRow, brandStyle]}>
          <Text style={styles.brandMark}>◆ </Text>
          Welcome to {BRAND_NAME}
        </Animated.Text>
      </Animated.View>

      <Animated.FlatList
        data={WELCOME_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          syncIndex(e.nativeEvent.contentOffset.x)
        }
        onScrollEndDrag={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          syncIndex(e.nativeEvent.contentOffset.x)
        }
        scrollEventThrottle={16}
        renderItem={({ item, index: itemIndex }) => (
          <SlideItem item={item} index={itemIndex} scrollX={scrollX} activeIndex={index} />
        )}
      />

      <Animated.View entering={FadeInUp.duration(500).delay(180)} style={styles.actions}>
        <AnimatedPressable
          accessibilityRole="button"
          onPress={() => {
            setAuthMode('signup');
            router.push('/(onboarding)/register' as Href);
          }}
          style={[styles.cta, createBtnStyle]}>
          <Animated.Text style={[styles.ctaLabel, createLabelStyle]}>Create account</Animated.Text>
        </AnimatedPressable>

        <AnimatedPressable
          accessibilityRole="button"
          onPress={() => {
            setAuthMode('login');
            router.push('/(onboarding)/login');
          }}
          style={[styles.cta, loginBtnStyle]}>
          <Animated.Text style={[styles.ctaLabel, loginLabelStyle]}>Log in</Animated.Text>
        </AnimatedPressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 28,
  },
  top: {
    paddingHorizontal: 20,
    gap: 16,
  },
  brandRow: {
    fontSize: 15,
    fontWeight: '500',
  },
  brandMark: {
    fontWeight: '700',
  },
  textDark: {
    color: '#000000',
  },
  slide: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  headline: {
    color: OnboardingColors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 40,
  },
  subtitle: {
    marginTop: 12,
    color: OnboardingColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 44,
  },
  subtitleDark: {
    color: '#60646C',
  },
  subtitleSpacer: {
    marginTop: 12,
    minHeight: 44,
  },
  visualWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  orb: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbDark: {
    backgroundColor: '#1A2540',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  orbLight: {
    backgroundColor: '#F0F2F5',
  },
  orbMark: {
    color: OnboardingColors.text,
    fontSize: 48,
  },
  orbMarkDark: {
    color: '#111111',
  },
  orbRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(91,158,255,0.25)',
  },
  orbRingLight: {
    borderColor: 'rgba(0,0,0,0.06)',
  },
  actions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cta: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});
