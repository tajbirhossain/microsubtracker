import { apiRequest } from '@/services/api/client';
import { clearStoredPushToken } from '@/services/push-notifications';
import {
  buildDevicePayload,
  clearSession,
  getOrCreateDeviceKey,
  getRefreshToken,
  saveSession,
  updateStoredUser,
} from '@/services/session';
import type {
  AuthSessionResult,
  AuthUser,
  OtpPurpose,
  OtpSentResult,
} from '@/types/api';

export async function registerStart(input: {
  email: string;
  password: string;
  displayName?: string;
  preferredCurrency?: string;
}): Promise<OtpSentResult> {
  const device = await buildDevicePayload();
  return apiRequest<OtpSentResult>('/auth/register/start', {
    method: 'POST',
    body: { ...input, email: input.email.trim().toLowerCase(), device },
  });
}

export async function registerVerify(input: {
  email: string;
  code: string;
}): Promise<AuthSessionResult> {
  const device = await buildDevicePayload();
  const session = await apiRequest<AuthSessionResult>('/auth/register/verify', {
    method: 'POST',
    body: { email: input.email.trim().toLowerCase(), code: input.code, device },
  });
  await saveSession(session.user, session.tokens, session.deviceId);
  return session;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthSessionResult | OtpSentResult> {
  const device = await buildDevicePayload();
  const result = await apiRequest<AuthSessionResult | OtpSentResult>('/auth/login', {
    method: 'POST',
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      device,
    },
  });

  if ('tokens' in result) {
    await saveSession(result.user, result.tokens, result.deviceId);
  }
  return result;
}

export async function loginVerifyDevice(input: {
  email: string;
  code: string;
}): Promise<AuthSessionResult> {
  const device = await buildDevicePayload();
  const session = await apiRequest<AuthSessionResult>('/auth/login/verify-device', {
    method: 'POST',
    body: { email: input.email.trim().toLowerCase(), code: input.code, device },
  });
  await saveSession(session.user, session.tokens, session.deviceId);
  return session;
}

export async function resendOtp(input: {
  email: string;
  purpose: OtpPurpose;
}): Promise<OtpSentResult> {
  return apiRequest<OtpSentResult>('/auth/otp/resend', {
    method: 'POST',
    body: { email: input.email.trim().toLowerCase(), purpose: input.purpose },
  });
}

export async function fetchMe(): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>('/auth/me', { auth: true });
  return data.user;
}

export async function updateProfile(input: {
  displayName: string;
}): Promise<AuthUser> {
  const data = await apiRequest<{ user: AuthUser }>('/auth/me', {
    method: 'PATCH',
    auth: true,
    body: { displayName: input.displayName.trim() },
  });
  await updateStoredUser(data.user);
  return data.user;
}

export async function logout(allDevices = false): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    const deviceKey = await getOrCreateDeviceKey();
    try {
      await apiRequest('/notifications/push-token', {
        method: 'PUT',
        auth: true,
        body: { deviceKey, pushToken: null },
      });
    } catch {
      // best-effort clear
    }
    await apiRequest<{ revoked: boolean }>('/auth/logout', {
      method: 'POST',
      auth: allDevices,
      body: allDevices ? { allDevices: true } : { refreshToken },
    });
  } catch {
    // still clear local session
  }
  await clearStoredPushToken();
  await clearSession();
}

export async function forgotPassword(email: string): Promise<OtpSentResult | { sent: true }> {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
  });
}

export async function resetPassword(input: {
  email: string;
  code: string;
  password: string;
}): Promise<{ reset: true }> {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: {
      email: input.email.trim().toLowerCase(),
      code: input.code,
      password: input.password,
    },
  });
}

export async function deleteAccount(): Promise<void> {
  await apiRequest<{ deleted: true }>('/auth/account', {
    method: 'DELETE',
    auth: true,
  });
  await clearSession();
}

export function isOtpResult(
  value: AuthSessionResult | OtpSentResult
): value is OtpSentResult {
  return 'requiresOtp' in value && value.requiresOtp === true;
}
