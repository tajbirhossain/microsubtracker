import { type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

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
  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        {floatingLabel ? <Text style={styles.floating}>{floatingLabel}</Text> : null}
        <View style={styles.row}>
          <TextInput
            placeholderTextColor={OnboardingColors.textMuted}
            selectionColor={OnboardingColors.link}
            style={[styles.input, floatingLabel && styles.inputWithLabel, style]}
            {...rest}
          />
          {rightAccessory}
        </View>
      </View>
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
  },
  input: {
    flex: 1,
    color: OnboardingColors.text,
    fontSize: 17,
    padding: 0,
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
