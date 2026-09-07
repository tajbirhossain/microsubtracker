import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

type Props = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function PrimaryButton({
  label,
  loading,
  disabled,
  variant = 'primary',
  style,
  labelStyle,
  onPress,
  ...rest
}: Props) {
  const isDisabled = Boolean(disabled || loading);
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <View
      style={[
        styles.shell,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        variant === 'ghost' && styles.ghost,
        isDisabled && isPrimary && styles.primaryDisabled,
        style,
      ]}>
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPress={onPress}
        android_ripple={
          isDisabled
            ? null
            : {
                color: isPrimary ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
                borderless: false,
              }
        }
        style={({ pressed }) => [
          styles.pressable,
          pressed && !isDisabled && styles.pressed,
        ]}
        {...rest}>
        {loading ? (
          <ActivityIndicator
            color={isPrimary ? OnboardingColors.primaryButtonText : OnboardingColors.text}
          />
        ) : (
          <Text
            pointerEvents="none"
            style={[
              styles.label,
              isPrimary && styles.primaryLabel,
              isSecondary && styles.secondaryLabel,
              variant === 'ghost' && styles.ghostLabel,
              isDisabled && isPrimary && styles.primaryDisabledLabel,
              labelStyle,
            ]}>
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: OnboardingColors.primaryButton,
  },
  primaryDisabled: {
    backgroundColor: OnboardingColors.disabledButton,
  },
  secondary: {
    backgroundColor: OnboardingColors.secondaryButton,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryLabel: {
    color: OnboardingColors.primaryButtonText,
  },
  primaryDisabledLabel: {
    color: OnboardingColors.disabledButtonText,
  },
  secondaryLabel: {
    color: OnboardingColors.secondaryButtonText,
  },
  ghostLabel: {
    color: OnboardingColors.link,
  },
});
