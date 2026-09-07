import type {
  CancellationApi,
  CancelGuide,
  CancelGuideProgress,
  CancellationEvent,
} from '@/types/cancellation';

const GUIDE_LIBRARY: Record<string, CancelGuide> = {
  openai: {
    id: 'guide-openai',
    providerKey: 'openai',
    title: 'Cancel ChatGPT Plus',
    summary: 'Stop the trial before it converts to a paid plan.',
    difficulty: 'easy',
    estimatedMinutes: 2,
    deepLinkUrl: null,
    webCancelUrl: 'https://chatgpt.com/#settings',
    tips: [
      'Cancel at least a few hours before the trial ends.',
      'You’ll usually keep access until the trial date.',
    ],
    steps: [
      {
        id: 'o1',
        title: 'Open ChatGPT settings',
        detail: 'On the web or app, open your account menu and go to Settings.',
        kind: 'open',
        estimatedSeconds: 20,
      },
      {
        id: 'o2',
        title: 'Go to My plan',
        detail: 'Find the Plus / subscription section for your billing details.',
        kind: 'navigate',
        estimatedSeconds: 20,
      },
      {
        id: 'o3',
        title: 'Choose Cancel plan',
        detail: 'Confirm cancellation. Keep a screenshot if you want proof.',
        kind: 'action',
        estimatedSeconds: 30,
      },
      {
        id: 'o4',
        title: 'Confirm you’re done',
        detail: 'Come back here and mark it cancelled so we stop reminding you.',
        kind: 'confirm',
        estimatedSeconds: 10,
      },
    ],
  },
  netflix: {
    id: 'guide-netflix',
    providerKey: 'netflix',
    title: 'Cancel Netflix',
    summary: 'Manage membership from your Netflix account page.',
    difficulty: 'easy',
    estimatedMinutes: 3,
    webCancelUrl: 'https://www.netflix.com/cancelplan',
    tips: ['Cancel anytime — billing usually stops at the end of the current period.'],
    steps: [
      {
        id: 'n1',
        title: 'Sign in on Netflix',
        detail: 'Use the account that pays for the membership.',
        kind: 'open',
      },
      {
        id: 'n2',
        title: 'Open Account',
        detail: 'Tap your profile icon, then Account.',
        kind: 'navigate',
      },
      {
        id: 'n3',
        title: 'Cancel membership',
        detail: 'Under Membership, choose Cancel membership and confirm.',
        kind: 'action',
      },
      {
        id: 'n4',
        title: 'Mark as cancelled here',
        detail: 'So your dashboard stays accurate.',
        kind: 'confirm',
      },
    ],
  },
  spotify: {
    id: 'guide-spotify',
    providerKey: 'spotify',
    title: 'Cancel Spotify Premium',
    summary: 'Premium may be billed by Spotify, Apple, or Google — cancel where you subscribed.',
    difficulty: 'medium',
    estimatedMinutes: 4,
    webCancelUrl: 'https://www.spotify.com/account/subscription/',
    tips: [
      'If you subscribed via the App Store, cancel in Apple Subscriptions.',
      'Same for Google Play if that’s where you paid.',
    ],
    steps: [
      {
        id: 's1',
        title: 'Check where you subscribed',
        detail: 'Spotify account → Subscription shows the billing source.',
        kind: 'open',
      },
      {
        id: 's2',
        title: 'Open that billing source',
        detail: 'Spotify web, Apple Subscriptions, or Google Play subscriptions.',
        kind: 'navigate',
      },
      {
        id: 's3',
        title: 'Cancel Premium',
        detail: 'Confirm cancel. Access usually continues until the period ends.',
        kind: 'action',
      },
      {
        id: 's4',
        title: 'Confirm in Micro Sub Tracker',
        detail: 'Mark cancelled so upcoming charges disappear from your list.',
        kind: 'confirm',
      },
    ],
  },
  youtube: {
    id: 'guide-youtube',
    providerKey: 'youtube',
    title: 'Cancel YouTube Premium',
    summary: 'Cancel from Google account memberships.',
    difficulty: 'easy',
    estimatedMinutes: 3,
    webCancelUrl: 'https://www.youtube.com/paid_memberships',
    tips: [],
    steps: [
      {
        id: 'y1',
        title: 'Open YouTube memberships',
        detail: 'Use the same Google account that pays for Premium.',
        kind: 'open',
      },
      {
        id: 'y2',
        title: 'Select YouTube Premium',
        detail: 'Open the membership details.',
        kind: 'navigate',
      },
      {
        id: 'y3',
        title: 'Cancel membership',
        detail: 'Confirm cancellation on the next screen.',
        kind: 'action',
      },
      {
        id: 'y4',
        title: 'Mark cancelled here',
        detail: 'We’ll stop counting it toward your monthly spend.',
        kind: 'confirm',
      },
    ],
  },
  adobe: {
    id: 'guide-adobe',
    providerKey: 'adobe',
    title: 'Cancel Adobe Creative Cloud',
    summary: 'Adobe plans often renew yearly — cancel early to avoid fees.',
    difficulty: 'hard',
    estimatedMinutes: 8,
    webCancelUrl: 'https://account.adobe.com/plans',
    tips: ['Some annual plans charge an early termination fee — read the prompt carefully.'],
    steps: [
      {
        id: 'a1',
        title: 'Sign in to Adobe account',
        detail: 'Open Plans & products for the subscription you want to end.',
        kind: 'open',
      },
      {
        id: 'a2',
        title: 'Manage plan',
        detail: 'Choose the Creative Cloud plan currently billing you.',
        kind: 'navigate',
      },
      {
        id: 'a3',
        title: 'Cancel plan',
        detail: 'Follow Adobe’s cancel flow and note any fee before confirming.',
        kind: 'action',
      },
      {
        id: 'a4',
        title: 'Confirm here',
        detail: 'Mark cancelled once Adobe shows the plan as ending.',
        kind: 'confirm',
      },
    ],
  },
  generic: {
    id: 'guide-generic',
    providerKey: 'generic',
    title: 'Cancel this subscription',
    summary: 'A short checklist that works for most services.',
    difficulty: 'medium',
    estimatedMinutes: 5,
    webCancelUrl: null,
    tips: [
      'Search “[service name] cancel subscription” if the site hides the cancel button.',
      'Check App Store / Google Play if you subscribed in-app.',
    ],
    steps: [
      {
        id: 'g1',
        title: 'Find account or billing',
        detail: 'Open the service website or app and go to Account / Billing / Membership.',
        kind: 'open',
      },
      {
        id: 'g2',
        title: 'Locate cancel / manage plan',
        detail: 'Look for Cancel, Manage subscription, or End membership.',
        kind: 'navigate',
      },
      {
        id: 'g3',
        title: 'Confirm cancellation',
        detail: 'Finish the flow and save any confirmation email.',
        kind: 'action',
      },
      {
        id: 'g4',
        title: 'Mark cancelled here',
        detail: 'Keeps your spend and calendar accurate.',
        kind: 'confirm',
      },
    ],
  },
};

function normalizeProviderKey(name: string, providerKey?: string | null): string {
  if (providerKey) return providerKey.toLowerCase();
  const n = name.toLowerCase();
  if (n.includes('chatgpt') || n.includes('openai')) return 'openai';
  if (n.includes('netflix')) return 'netflix';
  if (n.includes('spotify')) return 'spotify';
  if (n.includes('youtube')) return 'youtube';
  if (n.includes('adobe')) return 'adobe';
  return 'generic';
}

function cloneGuide(guide: CancelGuide): CancelGuide {
  return {
    ...guide,
    tips: [...guide.tips],
    steps: guide.steps.map((step) => ({ ...step })),
  };
}

/**
 * In-memory mock. Replace with `createHttpCancellationApi(baseUrl)` when the backend is ready.
 */
export function createMockCancellationApi(): CancellationApi {
  const progressBySubscription = new Map<string, CancelGuideProgress>();
  const eventLog: CancellationEvent[] = [];

  return {
    async getCancelGuide({ subscriptionId, providerKey, name }) {
      await delay(280);
      void subscriptionId;
      const key = normalizeProviderKey(name, providerKey);
      const guide = GUIDE_LIBRARY[key] ?? GUIDE_LIBRARY.generic;
      return cloneGuide(guide);
    },

    async getGuideProgress(subscriptionId) {
      await delay(120);
      return progressBySubscription.get(subscriptionId) ?? null;
    },

    async completeStep({ subscriptionId, guideId, stepId }) {
      await delay(180);
      const existing = progressBySubscription.get(subscriptionId);
      const completed = new Set(existing?.completedStepIds ?? []);
      completed.add(stepId);
      const next: CancelGuideProgress = {
        guideId,
        subscriptionId,
        completedStepIds: [...completed],
        updatedAt: new Date().toISOString(),
      };
      progressBySubscription.set(subscriptionId, next);
      eventLog.push({
        type: 'step_completed',
        subscriptionId,
        guideId,
        stepId,
      });
      return next;
    },

    async markCancelled(subscriptionId) {
      await delay(220);
      eventLog.push({ type: 'marked_cancelled', subscriptionId });
      return { ok: true };
    },

    async keepSubscription(subscriptionId) {
      await delay(160);
      eventLog.push({ type: 'kept_subscription', subscriptionId });
      return { ok: true };
    },

    async trackEvent(event) {
      eventLog.push(event);
    },
  };
}

/**
 * Skeleton HTTP client — point `EXPO_PUBLIC_API_URL` at your API later.
 * Endpoints are documented in comments so backend can mirror them.
 */
export function createHttpCancellationApi(baseUrl: string, getToken?: () => Promise<string | null>): CancellationApi {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = getToken ? await getToken() : null;
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Cancellation API ${response.status}: ${path}`);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  return {
    // GET /subscriptions/:id/cancel-guide
    getCancelGuide: ({ subscriptionId }) =>
      request(`/subscriptions/${subscriptionId}/cancel-guide`),

    // GET /subscriptions/:id/cancel-progress
    getGuideProgress: (subscriptionId) =>
      request(`/subscriptions/${subscriptionId}/cancel-progress`),

    // POST /subscriptions/:id/cancel-progress/steps
    completeStep: ({ subscriptionId, guideId, stepId }) =>
      request(`/subscriptions/${subscriptionId}/cancel-progress/steps`, {
        method: 'POST',
        body: JSON.stringify({ guideId, stepId }),
      }),

    // POST /subscriptions/:id/cancel
    markCancelled: (subscriptionId) =>
      request(`/subscriptions/${subscriptionId}/cancel`, { method: 'POST' }),

    // POST /subscriptions/:id/keep
    keepSubscription: (subscriptionId) =>
      request(`/subscriptions/${subscriptionId}/keep`, { method: 'POST' }),

    // POST /events/cancellation
    trackEvent: (event) =>
      request(`/events/cancellation`, {
        method: 'POST',
        body: JSON.stringify(event),
      }),
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Active API used by the app. Flip to HTTP when backend ships. */
export const cancellationApi: CancellationApi = createMockCancellationApi();

// When ready:
// export const cancellationApi = createHttpCancellationApi(
//   process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api'
// );
