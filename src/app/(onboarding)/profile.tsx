import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingInput } from '@/components/onboarding/OnboardingInput';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { SkipLink } from '@/components/onboarding/ProgressSegments';
import { OnboardingColors } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

const SUGGESTIONS = ['alex.sub', 'subs.alex', 'alextracks'];

export default function ProfileScreen() {
  const { draft, updateDraft } = useOnboarding();
  const initials =
    `${draft.firstName.charAt(0)}${draft.lastName.charAt(0)}`.toUpperCase() || 'MS';

  const raw = draft.username.replace(/^@/, '');
  const display = raw ? `@${raw}` : '@';
  const available = raw.length >= 3;
  const canContinue = raw.length >= 3;

  return (
    <OnboardingShell
      footer={
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/(onboarding)/plan')}
        />
      }>
      <View style={styles.topRow}>
        <View style={styles.flex} />
        <SkipLink onPress={() => router.push('/(onboarding)/plan')} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Your profile</Text>
          <Text style={styles.subtitle}>Add a username and photo so your account feels like yours</Text>
        </View>
        <Pressable style={styles.avatar} onPress={() => undefined}>
          <Text style={styles.avatarText}>{initials}</Text>
          <View style={styles.editBadge}>
            <Text style={styles.editIcon}>✎</Text>
          </View>
        </Pressable>
      </View>

      <OnboardingInput
        floatingLabel="Username"
        value={display}
        onChangeText={(text) => {
          const cleaned = text.replace(/^@/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 32);
          updateDraft({ username: cleaned });
        }}
        autoCapitalize="none"
        autoCorrect={false}
        rightAccessory={
          raw ? (
            <Pressable onPress={() => updateDraft({ username: '' })}>
              <Text style={styles.clear}>✕</Text>
            </Pressable>
          ) : null
        }
      />

      <View style={styles.metaRow}>
        <Text style={styles.availability}>
          {raw.length === 0 ? '' : available ? '✓ Username available' : 'Enter at least 3 characters'}
        </Text>
        <Text style={styles.counter}>{raw.length}/32</Text>
      </View>

      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, raw === s && styles.chipActive]}
            onPress={() => updateDraft({ username: s })}>
            <Text style={[styles.chipText, raw === s && styles.chipTextActive]}>@{s}</Text>
          </Pressable>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    marginBottom: 28,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: OnboardingColors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: OnboardingColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#5B4B8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: OnboardingColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 12,
    color: '#000',
  },
  clear: {
    color: OnboardingColors.textMuted,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  availability: {
    color: OnboardingColors.textSecondary,
    fontSize: 13,
  },
  counter: {
    color: OnboardingColors.textMuted,
    fontSize: 13,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    backgroundColor: OnboardingColors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: OnboardingColors.link,
  },
  chipText: {
    color: OnboardingColors.text,
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
