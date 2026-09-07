import type { Subscription } from '@/constants/dashboard';

export type CancelStepKind = 'open' | 'navigate' | 'action' | 'confirm';

export type CancelStep = {
  id: string;
  title: string;
  detail: string;
  kind: CancelStepKind;
  estimatedSeconds?: number;
};

export type CancelGuide = {
  id: string;
  providerKey: string;
  title: string;
  summary: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  deepLinkUrl?: string | null;
  webCancelUrl?: string | null;
  steps: CancelStep[];
  tips: string[];
};

export type CancelGuideProgress = {
  guideId: string;
  subscriptionId: string;
  completedStepIds: string[];
  updatedAt: string;
};

export type CancellationEvent =
  | { type: 'guide_opened'; subscriptionId: string; guideId: string }
  | { type: 'step_completed'; subscriptionId: string; guideId: string; stepId: string }
  | { type: 'marked_cancelled'; subscriptionId: string; guideId?: string }
  | { type: 'kept_subscription'; subscriptionId: string };

/**
 * Contract the UI talks to. Swap `mockCancellationApi` for an HTTP client later
 * without changing drawers/cards.
 */
export type CancellationApi = {
  getCancelGuide(input: {
    subscriptionId: string;
    providerKey?: string | null;
    name: string;
  }): Promise<CancelGuide | null>;

  getGuideProgress(subscriptionId: string): Promise<CancelGuideProgress | null>;

  completeStep(input: {
    subscriptionId: string;
    guideId: string;
    stepId: string;
  }): Promise<CancelGuideProgress>;

  markCancelled(subscriptionId: string): Promise<{ ok: true }>;

  keepSubscription(subscriptionId: string): Promise<{ ok: true }>;

  trackEvent(event: CancellationEvent): Promise<void>;
};

export type TrialActionCard = {
  subscription: Subscription;
  urgency: 'critical' | 'soon' | 'upcoming';
  daysLeft: number;
  chargeAmountLabel: string;
  headline: string;
  subcopy: string;
};
