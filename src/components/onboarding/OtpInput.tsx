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

  const setDigit = (index: number, char: string) => {
    const next = digits.slice();
    const cleaned = char.replace(/\D/g, '');

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, length).split('');
      for (let i = 0; i < length; i++) {
        next[i] = pasted[i] ?? '';
      }
      onChange(next.join(''));
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
      return;
    }

    next[index] = cleaned.slice(-1);
    onChange(next.join(''));

    if (cleaned && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const next = digits.slice();
      next[index - 1] = '';
      onChange(next.join(''));
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
              textContentType={i === 0 ? 'oneTimeCode' : 'none'}
              autoComplete={i === 0 ? 'sms-otp' : 'off'}
              maxLength={length}
              selectTextOnFocus
              importantForAutofill={i === 0 ? 'yes' : 'no'}
              style={[styles.box, (value.length === i || (value.length === length && i === length - 1)) && styles.boxActive]}
              selectionColor={OnboardingColors.link}
            />
          </Fragment>
        ))}
      </View>
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
});
