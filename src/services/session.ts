import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getStoredPushToken } from '@/services/push-notifications';
import type { AuthTokens, AuthUser, DevicePayload } from '@/types/api';

const KEYS = {
  accessToken: 'mst.accessToken',
  refreshToken: 'mst.refreshToken',
  user: 'mst.user',
  deviceKey: 'mst.deviceKey',
  deviceId: 'mst.deviceId',
} as const;

async function secureSet(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function secureGet(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value != null) return value;
  } catch {
    // fall through to AsyncStorage
  }
  return AsyncStorage.getItem(key);
}

async function secureDelete(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
  await AsyncStorage.removeItem(key);
}

function randomKey() {
  return `mst-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function getOrCreateDeviceKey(): Promise<string> {
  const existing = await AsyncStorage.getItem(KEYS.deviceKey);
  if (existing) return existing;
  const created = randomKey();
  await AsyncStorage.setItem(KEYS.deviceKey, created);
  return created;
}

export async function buildDevicePayload(pushToken?: string): Promise<DevicePayload> {
  const deviceKey = await getOrCreateDeviceKey();
  const platform =
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
  const resolvedToken = pushToken ?? (await getStoredPushToken()) ?? undefined;

  return {
    deviceKey,
    platform,
    ...(resolvedToken ? { pushToken: resolvedToken } : {}),
    ...(Application.nativeApplicationVersion
      ? { appVersion: Application.nativeApplicationVersion }
      : {}),
  };
}

export async function saveSession(user: AuthUser, tokens: AuthTokens, deviceId?: string) {
  await Promise.all([
    secureSet(KEYS.accessToken, tokens.accessToken),
    secureSet(KEYS.refreshToken, tokens.refreshToken),
    AsyncStorage.setItem(KEYS.user, JSON.stringify(user)),
    deviceId ? AsyncStorage.setItem(KEYS.deviceId, deviceId) : Promise.resolve(),
  ]);
}

export async function clearSession() {
  await Promise.all([
    secureDelete(KEYS.accessToken),
    secureDelete(KEYS.refreshToken),
    AsyncStorage.removeItem(KEYS.user),
    AsyncStorage.removeItem(KEYS.deviceId),
  ]);
}

export async function getAccessToken() {
  return secureGet(KEYS.accessToken);
}

export async function getRefreshToken() {
  return secureGet(KEYS.refreshToken);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function updateStoredUser(user: AuthUser): Promise<void> {
  await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
}

export async function hasStoredSession(): Promise<boolean> {
  const [access, refresh] = await Promise.all([getAccessToken(), getRefreshToken()]);
  return Boolean(access && refresh);
}
