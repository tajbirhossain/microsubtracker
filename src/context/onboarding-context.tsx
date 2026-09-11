import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchMe,
  isOtpResult,
  login as apiLogin,
  loginVerifyDevice,
  logout as apiLogout,
  registerStart,
  registerVerify,
  resendOtp,
  updateProfile,
} from '@/services/api/auth';
import { ApiError } from '@/services/api/client';
import { clearSession, getStoredUser, hasStoredSession, updateStoredUser } from '@/services/session';
import type { AuthUser, OtpPurpose } from '@/types/api';
import type { Country } from '@/constants/onboarding';
import { COUNTRIES } from '@/constants/onboarding';

export type AuthMode = 'signup' | 'login';

export type OnboardingDraft = {
  email: string;
  password: string;
  phoneCountry: Country;
  firstName: string;
  lastName: string;
  alias: string;
  residenceCountry: Country;
  interests: string[];
  username: string;
  selectedPlanId: string;
  notificationsEnabled: boolean;
};

type ActionResult = { ok: boolean; error?: string; requiresOtp?: boolean; otpHint?: string };

type OnboardingContextValue = {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  draft: OnboardingDraft;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  resetDraft: () => void;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  otpPurpose: OtpPurpose | null;
  lastOtpHint?: string;
  submitCredentials: () => Promise<ActionResult>;
  verifyCode: (code: string) => Promise<ActionResult>;
  resendCode: () => Promise<ActionResult>;
  saveDisplayName: () => Promise<ActionResult>;
  completeOnboarding: () => Promise<{ ok: boolean }>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

const defaultDraft: OnboardingDraft = {
  email: '',
  password: '',
  phoneCountry: COUNTRIES[0],
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

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose | null>(null);
  const [lastOtpHint, setLastOtpHint] = useState<string | undefined>();

  const updateDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(defaultDraft);
    setAuthMode('signup');
    setOtpPurpose(null);
    setLastOtpHint(undefined);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const hasSession = await hasStoredSession();
      if (!hasSession) {
        setUser(null);
        return;
      }

      const stored = await getStoredUser();
      if (stored) setUser(stored);

      try {
        const me = await Promise.race([
          fetchMe(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Session restore timed out')), 12_000);
          }),
        ]);
        setUser(me);
        await updateStoredUser(me);
      } catch {
        if (!stored) {
          await clearSession();
          setUser(null);
        }
      }
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const submitCredentials = useCallback(async (): Promise<ActionResult> => {
    const email = draft.email.trim().toLowerCase();
    const password = draft.password;

    if (!isValidEmail(email)) {
      return { ok: false, error: 'Enter a valid email address' };
    }
    if (password.length < 8) {
      return { ok: false, error: 'Password must be at least 8 characters' };
    }

    try {
      if (authMode === 'signup') {
        const displayName =
          [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim() || undefined;
        const result = await registerStart({
          email,
          password,
          displayName,
        });
        setOtpPurpose(result.purpose);
        setLastOtpHint(result.otp);
        return {
          ok: true,
          requiresOtp: true,
          otpHint: result.otp,
        };
      }

      const result = await apiLogin({ email, password });
      if (isOtpResult(result)) {
        setOtpPurpose(result.purpose);
        setLastOtpHint(result.otp);
        return { ok: true, requiresOtp: true, otpHint: result.otp };
      }

      setUser(result.user);
      setOtpPurpose(null);
      return { ok: true, requiresOtp: false };
    } catch (error) {
      return { ok: false, error: errorMessage(error, 'Unable to continue. Try again.') };
    }
  }, [authMode, draft.email, draft.password, draft.firstName, draft.lastName]);

  const verifyCode = useCallback(
    async (code: string): Promise<ActionResult> => {
      if (!/^\d{6}$/.test(code)) {
        return { ok: false, error: 'Incorrect code entered' };
      }

      const email = draft.email.trim().toLowerCase();
      try {
        if (authMode === 'signup' || otpPurpose === 'registration') {
          const session = await registerVerify({ email, code });
          setUser(session.user);
          setOtpPurpose(null);
          return { ok: true };
        }

        const session = await loginVerifyDevice({ email, code });
        setUser(session.user);
        setOtpPurpose(null);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: errorMessage(error, 'Incorrect code entered') };
      }
    },
    [authMode, draft.email, otpPurpose]
  );

  const resendCode = useCallback(async (): Promise<ActionResult> => {
    const purpose = otpPurpose ?? (authMode === 'signup' ? 'registration' : 'new_device');
    try {
      const result = await resendOtp({
        email: draft.email.trim().toLowerCase(),
        purpose,
      });
      setOtpPurpose(result.purpose);
      setLastOtpHint(result.otp);
      return { ok: true, otpHint: result.otp };
    } catch (error) {
      return { ok: false, error: errorMessage(error, 'Could not resend code') };
    }
  }, [authMode, draft.email, otpPurpose]);

  const saveDisplayName = useCallback(async (): Promise<ActionResult> => {
    const displayName = [draft.firstName, draft.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!displayName) {
      return { ok: false, error: 'Enter your first and last name' };
    }

    try {
      const updated = await updateProfile({ displayName });
      setUser(updated);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error, 'Could not save your name') };
    }
  }, [draft.firstName, draft.lastName]);

  const completeOnboarding = useCallback(async () => {
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout(false);
    } catch {
      await clearSession();
    }
    setUser(null);
    resetDraft();
  }, [resetDraft]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      authMode,
      setAuthMode,
      draft,
      updateDraft,
      resetDraft,
      user,
      isAuthenticated: Boolean(user),
      isAuthReady,
      otpPurpose,
      lastOtpHint,
      submitCredentials,
      verifyCode,
      resendCode,
      saveDisplayName,
      completeOnboarding,
      signOut,
      restoreSession,
    }),
    [
      authMode,
      draft,
      updateDraft,
      resetDraft,
      user,
      isAuthReady,
      otpPurpose,
      lastOtpHint,
      submitCredentials,
      verifyCode,
      resendCode,
      saveDisplayName,
      completeOnboarding,
      signOut,
      restoreSession,
    ]
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
