import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { ProgressSegments } from '@/components/onboarding/ProgressSegments';
import { BRAND_NAME, OnboardingColors, WELCOME_SLIDES, type WelcomeSlide } from '@/constants/onboarding';

const { width } = Dimensions.get('window');

function WelcomeVisual({ visual, theme }: { visual: WelcomeSlide['visual']; theme: WelcomeSlide['theme'] }) {
  const isLight = theme === 'light';
  return (
    <View style={styles.visualWrap}>
      <View style={[styles.orb, isLight ? styles.orbLight : styles.orbDark]}>
        <Text style={[styles.orbMark, isLight && styles.orbMarkDark]}>
          {visual === 'control' ? '◎' : visual === 'track' ? '☰' : '⏱'}
        </Text>
      </View>
      <View style={[styles.orbRing, isLight && styles.orbRingLight]} />
    </View>
  );
}

export default function WelcomeScreen() {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const slide = WELCOME_SLIDES[index];
  const isLight = slide.theme === 'light';

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index && next >= 0 && next < WELCOME_SLIDES.length) {
      setIndex(next);
    }
  };

  return (
    <View style={[styles.root, isLight ? styles.rootLight : styles.rootDark]}>
      <View style={styles.top}>
        <ProgressSegments count={WELCOME_SLIDES.length} activeIndex={index} />
        <Text style={[styles.brandRow, isLight && styles.textDark]}>
          <Text style={styles.brandMark}>◆ </Text>
          Welcome to {BRAND_NAME}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={WELCOME_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={[styles.headline, item.theme === 'light' && styles.textDark]}>{item.headline}</Text>
            {item.subtitle ? (
              <Text style={[styles.subtitle, item.theme === 'light' && styles.subtitleDark]}>{item.subtitle}</Text>
            ) : null}
            <WelcomeVisual visual={item.visual} theme={item.theme} />
          </View>
        )}
      />

      <View style={styles.actions}>
        <PrimaryButton
          label="Create account"
          onPress={() => router.push('/(onboarding)/phone')}
          style={isLight ? styles.createLight : undefined}
        />
        <PrimaryButton
          label="Log in"
          variant="secondary"
          onPress={() => router.push('/(onboarding)/login')}
          style={isLight ? styles.loginLight : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 28,
  },
  rootDark: {
    backgroundColor: OnboardingColors.background,
  },
  rootLight: {
    backgroundColor: '#FFFFFF',
  },
  top: {
    paddingHorizontal: 20,
    gap: 16,
  },
  brandRow: {
    color: OnboardingColors.text,
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
  },
  subtitleDark: {
    color: '#60646C',
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
  createLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D0D5',
  },
  loginLight: {
    backgroundColor: '#000000',
  },
});
