import { Fragment, useEffect, useRef } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

import { OnboardingColors } from '@/constants/onboarding';

type Props = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
};

export function OtpInput({ value, onChange, length = 6, autoFocus = true }: Props) {
  const refs = useRef<Array<TextInput | null>>(Array.from({ length }, () => null));
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => refs.current[0]?.focus(), 150);
    return () => clearTimeout(t);
  }, [autoFocus]);

  const applyPaste = (cleaned: string) => {
    const pasted = cleaned.slice(0, length);
    onChange(pasted);
    const focusAt = Math.min(Math.max(pasted.length - 1, 0), length - 1);
    if (pasted.length >= length) {
      refs.current[focusAt]?.blur();
    } else {
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  };

  const applySingle = (index: number, digit: string) => {
    if (!digit) {
      onChange(value.slice(0, index));
      return;
    }

    const next = (value.slice(0, index) + digit + value.slice(index + 1)).slice(0, length);
    onChange(next);

    if (index < length - 1) {
      refs.current[index + 1]?.focus();
    } else {
      refs.current[index]?.blur();
    }
  };

  const setDigit = (index: number, text: string) => {
    const cleaned = text.replace(/\D/g, '');

    if (cleaned.length > 1) {
      // Full-code paste/autofill. A 2-char "old+new" in a filled box is not a paste.
      if (cleaned.length >= length || value.length === 0 || index === 0) {
        applyPaste(cleaned);
        return;
      }
      applySingle(index, cleaned.slice(-1));
      return;
    }

    applySingle(index, cleaned);
  };

  const onKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      onChange(value.slice(0, index - 1));
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.boxes}>
        {digits.map((digit, i) => (
          <Fragment key={i}>
            {i === 3 ? <Text style={styles.dash}>–</Text> : null}
            <TextInput
              ref={(node) => {
                refs.current[i] = node;
              }}
              value={digit}
              onChangeText={(text) => setDigit(i, text)}
              onKeyPress={(e) => onKeyPress(i, e)}
              keyboardType="number-pad"
              textContentType="none"
              autoComplete="off"
              maxLength={1}
              caretHidden
              selectTextOnFocus
              importantForAutofill="no"
              style={[
                styles.box,
                (value.length === i || (value.length === length && i === length - 1)) &&
                  styles.boxActive,
              ]}
              selectionColor={OnboardingColors.link}
            />
          </Fragment>
        ))}
      </View>
      <TextInput
        value=""
        onChangeText={(text) => {
          const cleaned = text.replace(/\D/g, '');
          if (cleaned.length > 1) applyPaste(cleaned);
        }}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        keyboardType="number-pad"
        style={styles.hiddenAutofill}
        caretHidden
        importantForAutofill="yes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 28,
  },
  boxes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: OnboardingColors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OnboardingColors.border,
    color: OnboardingColors.text,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    padding: 0,
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : null),
  },
  boxActive: {
    borderColor: OnboardingColors.text,
  },
  dash: {
    color: OnboardingColors.text,
    fontSize: 20,
    marginHorizontal: 2,
  },
  hiddenAutofill: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
});
