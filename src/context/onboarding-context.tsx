import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Country } from '@/constants/onboarding';
import { COUNTRIES } from '@/constants/onboarding';

export type OnboardingDraft = {
  phoneCountry: Country;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  alias: string;
  residenceCountry: Country;
  interests: string[];
  username: string;
  selectedPlanId: string;
  notificationsEnabled: boolean;
};

type OnboardingContextValue = {
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
  submitPhone: () => Promise<{ ok: boolean; error?: string }>;
  verifyCode: (code: string) => Promise<{ ok: boolean; error?: string }>;
  resendCode: () => Promise<{ ok: boolean }>;
  completeOnboarding: () => Promise<{ ok: boolean }>;
};

const defaultDraft: OnboardingDraft = {
  phoneCountry: COUNTRIES[0],
  phoneNumber: '',
  firstName: '',
  lastName: '',
  alias: '',
  residenceCountry: COUNTRIES[0],
  interests: [],
  username: '',
  selectedPlanId: 'plus',
  notificationsEnabled: false,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

async function fakeDelay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      draft,
      updateDraft: (patch) => setDraft((prev) => ({ ...prev, ...patch })),
      resetDraft: () => setDraft(defaultDraft),
      submitPhone: async () => {
        await fakeDelay();
        if (draft.phoneNumber.replace(/\D/g, '').length < 7) {
          return { ok: false, error: 'Enter a valid phone number' };
        }
        return { ok: true };
      },
      verifyCode: async (code: string) => {
        await fakeDelay(500);
        if (code.length !== 6 || code === '000000') {
          return { ok: false, error: 'Incorrect code entered' };
        }
        return { ok: true };
      },
      resendCode: async () => {
        await fakeDelay(400);
        return { ok: true };
      },
      completeOnboarding: async () => {
        await fakeDelay(400);
        return { ok: true };
      },
    }),
    [draft]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return ctx;
}
