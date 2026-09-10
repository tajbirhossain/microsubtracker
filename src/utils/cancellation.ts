import type { Subscription } from '@/constants/dashboard';
import type { TrialActionCard } from '@/types/cancellation';
import { formatMoney } from '@/utils/subscriptions';

export function buildTrialActionCards(
  subscriptions: Subscription[],
  formatAmount: (amount: number, currency: string) => string = (amount, currency) =>
    formatMoney(amount, currency)
): TrialActionCard[] {
  return subscriptions
    .filter((sub) => sub.status !== 'cancelled' && sub.isTrial)
    .map((subscription) => {
      const daysLeft = Math.max(0, subscription.trialEndsInDays ?? 0);
      const urgency: TrialActionCard['urgency'] =
        daysLeft <= 1 ? 'critical' : daysLeft <= 3 ? 'soon' : 'upcoming';
      const amountLabel = formatAmount(subscription.amount, subscription.currency);

      return {
        subscription,
        urgency,
        daysLeft,
        chargeAmountLabel: `${amountLabel}/${subscription.billingCycle === 'yearly' ? 'yr' : 'mo'}`,
        headline:
          daysLeft === 0
            ? 'Trial ends today'
            : daysLeft === 1
              ? 'Trial ends tomorrow'
              : `Trial ends in ${daysLeft} days`,
        subcopy:
          daysLeft <= 1
            ? `Cancel now to avoid ${amountLabel}`
            : `Then ${amountLabel} starts charging`,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function difficultyLabel(value: 'easy' | 'medium' | 'hard'): string {
  switch (value) {
    case 'easy':
      return 'Usually easy';
    case 'hard':
      return 'Can be tricky';
    default:
      return 'A few steps';
  }
}
