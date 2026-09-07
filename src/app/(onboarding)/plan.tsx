import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import {
  PaywallFeatureList,
  PaywallHeroCard,
  PaywallPerksRow,
  PlanSwitcher,
} from '@/components/onboarding/PaywallSections';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { OnboardingColors, PLANS, type PlanTier } from '@/constants/onboarding';
import { useOnboarding } from '@/context/onboarding-context';

export default function PlanScreen() {
  const { draft, updateDraft, completeOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const plan = useMemo(() => {
    const match = PLANS.find((p) => p.id === draft.selectedPlanId);
    return match ?? PLANS[0];
  }, [draft.selectedPlanId]);

  const finish = async () => {
    setLoading(true);
    await completeOnboarding();
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  const onSelectPlan = (id: PlanTier['id']) => {
    updateDraft({ selectedPlanId: id });
  };

  return (
    <OnboardingShell
      footer={
        <>
          <PrimaryButton label={plan.cta} loading={loading} onPress={finish} />
          <Text style={styles.legal}>
            {plan.billingNote} See <Text style={styles.link}>Promotion Terms</Text> and{' '}
            <Text style={styles.link}>Plan Terms</Text>.
          </Text>
        </>
      }>
      <View style={styles.topRow}>
        <Text style={styles.title}>Select plan</Text>
        <Pressable onPress={finish} hitSlop={10}>
          <Text style={styles.notNow}>Not now</Text>
        </Pressable>
      </View>

      <PlanSwitcher plans={PLANS} selectedId={plan.id} onSelect={onSelectPlan} />

      <PaywallHeroCard plan={plan} />
      <PaywallPerksRow planName={plan.name} perks={plan.perks} />
      <PaywallFeatureList features={plan.features} />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  title: {
    color: OnboardingColors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  notNow: {
    color: OnboardingColors.link,
    fontSize: 16,
    fontWeight: '500',
  },
  legal: {
    color: OnboardingColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  link: {
    color: OnboardingColors.link,
  },
});
