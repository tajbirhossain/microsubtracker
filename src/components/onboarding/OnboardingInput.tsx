import { useRef, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

type Props = TextInputProps & {
  hint?: string;
  floatingLabel?: string;
  rightAccessory?: ReactNode;
};

export function OnboardingInput({
  hint,
  floatingLabel,
  rightAccessory,
  style,
  ...rest
}: Props) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={styles.field}
        accessibilityRole="none">
        {floatingLabel ? <Text style={styles.floating}>{floatingLabel}</Text> : null}
        <View style={styles.row}>
          <TextInput
            ref={inputRef}
            placeholderTextColor={OnboardingColors.textMuted}
            selectionColor={OnboardingColors.link}
            style={[styles.input, floatingLabel && styles.inputWithLabel, style]}
            {...rest}
          />
          {rightAccessory}
        </View>
      </Pressable>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  field: {
    backgroundColor: OnboardingColors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OnboardingColors.border,
  },
  floating: {
    color: OnboardingColors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 28,
  },
  input: {
    flex: 1,
    color: OnboardingColors.text,
    fontSize: 17,
    padding: 0,
    margin: 0,
    minHeight: 28,
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : null),
  },
  inputWithLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  hint: {
    color: OnboardingColors.textSecondary,
    fontSize: 13,
    marginLeft: 4,
  },
});
