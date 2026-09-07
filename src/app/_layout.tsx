import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { NetworkProvider } from '@/context/network-context';
import { OnboardingProvider } from '@/context/onboarding-context';
import { PreferencesProvider } from '@/context/preferences-context';
import { SubscriptionsProvider } from '@/context/subscriptions-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <NetworkProvider>
      <OnboardingProvider>
        <PreferencesProvider>
          <SubscriptionsProvider>
            <StatusBar style="light" />
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </SubscriptionsProvider>
        </PreferencesProvider>
      </OnboardingProvider>
    </NetworkProvider>
  );
}
