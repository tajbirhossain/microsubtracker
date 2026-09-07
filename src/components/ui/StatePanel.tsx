import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { DashboardColors } from '@/constants/dashboard';

type Tone = 'neutral' | 'accent' | 'warning' | 'danger';

type Props = {
  title: string;
  body: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
};

const TONE_STYLES: Record<Tone, { border: string; bg: string }> = {
  neutral: { border: DashboardColors.border, bg: DashboardColors.surface },
  accent: { border: 'rgba(91,158,255,0.3)', bg: DashboardColors.accentSoft },
  warning: { border: 'rgba(251,191,36,0.35)', bg: DashboardColors.macroSoft },
  danger: { border: 'rgba(255,69,58,0.35)', bg: DashboardColors.dangerSoft },
};

export function StatePanel({
  title,
  body,
  ctaLabel,
  onCtaPress,
  secondaryLabel,
  onSecondaryPress,
  tone = 'neutral',
  style,
}: Props) {
  const palette = TONE_STYLES[tone];

  return (
    <View style={[styles.panel, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {ctaLabel && onCtaPress ? (
        <Pressable style={styles.cta} onPress={onCtaPress} hitSlop={4}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
      {secondaryLabel && onSecondaryPress ? (
        <Pressable style={styles.secondary} onPress={onSecondaryPress} hitSlop={4}>
          <Text style={styles.secondaryText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 8,
  },
  title: {
    color: DashboardColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  body: {
    color: DashboardColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  secondary: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 6,
  },
  secondaryText: {
    color: DashboardColors.accent,
    fontWeight: '600',
    fontSize: 13,
  },
});
