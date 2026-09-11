import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationPermissionStatus = 'unknown' | 'granted' | 'denied';

const PUSH_TOKEN_KEY = 'mst.pushToken';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function mapPermissionStatus(
  status: Notifications.PermissionStatus
): NotificationPermissionStatus {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'unknown';
}

export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

export async function clearStoredPushToken(): Promise<void> {
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Micro Sub Tracker',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function resolveProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    undefined
  );
}

export async function getOsNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (Platform.OS === 'web') return 'denied';
  const current = await Notifications.getPermissionsAsync();
  return mapPermissionStatus(current.status);
}

export async function requestOsNotificationPermission(): Promise<{
  status: NotificationPermissionStatus;
  token: string | null;
}> {
  if (Platform.OS === 'web') {
    return { status: 'denied', token: null };
  }

  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  const mapped = mapPermissionStatus(status);
  if (mapped !== 'granted') {
    await clearStoredPushToken();
    return { status: mapped, token: null };
  }

  if (!Device.isDevice) {
    // Simulator/emulator: permission can be granted but Expo push tokens are unreliable.
    return { status: 'granted', token: null };
  }

  try {
    const projectId = resolveProjectId();
    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, tokenResult.data);
    return { status: 'granted', token: tokenResult.data };
  } catch (error) {
    console.warn('Failed to get Expo push token', error);
    return { status: 'granted', token: null };
  }
}

export async function refreshExpoPushToken(): Promise<string | null> {
  const status = await getOsNotificationPermission();
  if (status !== 'granted' || !Device.isDevice) {
    return getStoredPushToken();
  }

  try {
    await ensureAndroidChannel();
    const projectId = resolveProjectId();
    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, tokenResult.data);
    return tokenResult.data;
  } catch (error) {
    console.warn('Failed to refresh Expo push token', error);
    return getStoredPushToken();
  }
}
