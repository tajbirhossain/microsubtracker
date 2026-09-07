import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { PlanTier } from '@/constants/onboarding';
import { OnboardingColors } from '@/constants/onboarding';

type SwitcherProps = {
  plans: PlanTier[];
  selectedId: string;
  onSelect: (id: PlanTier['id']) => void;
};

export function PlanSwitcher({ plans, selectedId, onSelect }: SwitcherProps) {
  return (
    <View style={styles.switcher}>
      {plans.map((plan) => {
        const active = plan.id === selectedId;
        return (
          <Pressable
            key={plan.id}
            onPress={() => onSelect(plan.id)}
            style={[styles.tab, active && styles.tabActive]}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{plan.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type HeroProps = {
  plan: PlanTier;
};

export function PaywallHeroCard({ plan }: HeroProps) {
  return (
    <LinearGradient colors={[...plan.accent]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.hero}>
      <View style={styles.heroTop}>
        <Text style={styles.planName}>{plan.name}</Text>
        {plan.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>✦</Text>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.heroArt}>
        <View style={[styles.cardStack, styles.cardBack]} />
        <View style={[styles.cardStack, styles.cardMid]} />
        <View style={[styles.cardStack, styles.cardFront]}>
          <Text style={styles.cardBrand}>Micro Sub Tracker</Text>
          <Text style={styles.cardPlan}>{plan.name}</Text>
        </View>
      </View>

      <Text style={styles.price}>{plan.priceLabel}</Text>
      <Text style={styles.tagline}>{plan.tagline}</Text>
    </LinearGradient>
  );
}

type PerksProps = {
  planName: string;
  perks: PlanTier['perks'];
};

export function PaywallPerksRow({ planName, perks }: PerksProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Included with {planName}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.perksRow}>
        {perks.map((perk) => (
          <View key={perk.id} style={styles.perkItem}>
            <View style={styles.perkCircle}>
              <Text style={styles.perkIcon}>{perk.icon}</Text>
            </View>
            <Text style={styles.perkLabel}>{perk.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

type FeaturesProps = {
  features: PlanTier['features'];
};

export function PaywallFeatureList({ features }: FeaturesProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Top features</Text>
      {features.map((feature) => (
        <View key={feature.title} style={styles.featureCard}>
          <View style={styles.featureIconWrap}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
          </View>
          <View style={styles.featureCopy}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  tabText: {
    color: OnboardingColors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: OnboardingColors.text,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    minHeight: 220,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  planName: {
    color: OnboardingColors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeIcon: {
    color: OnboardingColors.text,
    fontSize: 11,
  },
  badgeText: {
    color: OnboardingColors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  heroArt: {
    height: 88,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStack: {
    position: 'absolute',
    width: 168,
    height: 96,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardBack: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ rotate: '-8deg' }, { translateX: -18 }],
  },
  cardMid: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '4deg' }, { translateX: 16 }],
  },
  cardFront: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    padding: 14,
    justifyContent: 'space-between',
  },
  cardBrand: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  cardPlan: {
    color: OnboardingColors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  price: {
    color: OnboardingColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  tagline: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  section: {
    marginTop: 26,
  },
  sectionLabel: {
    color: OnboardingColors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  perksRow: {
    gap: 16,
    paddingRight: 8,
  },
  perkItem: {
    width: 76,
    alignItems: 'center',
  },
  perkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  perkIcon: {
    fontSize: 22,
  },
  perkLabel: {
    color: OnboardingColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 15,
  },
  featureCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 20,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: OnboardingColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  featureDesc: {
    color: OnboardingColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});
