import { useEffect, useState, type ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingColors } from '@/constants/onboarding';

type Edge = 'top' | 'bottom' | 'left' | 'right';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  scroll?: boolean;
};

export function OnboardingShell({
  children,
  footer,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
  scroll = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const useBottomInset = edges.includes('bottom');
  const safeEdges = edges.filter((edge) => edge !== 'bottom');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const bottomOffset = keyboardHeight > 0 ? keyboardHeight : useBottomInset ? insets.bottom : 0;

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[OnboardingColors.backgroundTop, OnboardingColors.backgroundMid, OnboardingColors.background]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={safeEdges}>
        <View style={[styles.flex, { paddingBottom: bottomOffset }]}>
          {scroll ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={[styles.scrollContent, contentStyle]}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces={false}>
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.flex, styles.padded, contentStyle]}>{children}</View>
          )}

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: OnboardingColors.background,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
    width: '100%',
    zIndex: 10,
    elevation: 10,
  },
});
