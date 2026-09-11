import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export type NotificationPermissionStatus = 'unknown' | 'granted' | 'denied';

const PUSH_TOKEN_KEY = 'mst.pushToken';

type NotificationsNS = typeof import('expo-notifications');

let cachedNotifications: NotificationsNS | null | undefined;
let handlerReady = false;

/** Android Expo Go (SDK 53+) throws on import — remote push needs a dev/prod build. */
function isAndroidExpoGo(): boolean {
  return Constants.appOwnership === 'expo' && Platform.OS === 'android';
}

function loadNotifications(): NotificationsNS | null {
  if (isAndroidExpoGo()) {
    return null;
  }
  if (cachedNotifications !== undefined) {
    return cachedNotifications;
  }
  try {
    // Lazy load so Expo Go Android does not crash at app boot.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedNotifications = require('expo-notifications') as NotificationsNS;
  } catch (error) {
    console.warn('expo-notifications unavailable in this client', error);
    cachedNotifications = null;
  }
  return cachedNotifications;
}

function ensureHandler(Notifications: NotificationsNS): void {
  if (handlerReady) return;
  handlerReady = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function mapPermissionStatus(status: string): NotificationPermissionStatus {
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

async function ensureAndroidChannel(Notifications: NotificationsNS): Promise<void> {
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
  if (Platform.OS === 'web' || isAndroidExpoGo()) return 'denied';
  const Notifications = loadNotifications();
  if (!Notifications) return 'denied';
  ensureHandler(Notifications);
  const current = await Notifications.getPermissionsAsync();
  return mapPermissionStatus(current.status);
}

export async function requestOsNotificationPermission(): Promise<{
  status: NotificationPermissionStatus;
  token: string | null;
}> {
  if (Platform.OS === 'web' || isAndroidExpoGo()) {
    return { status: 'denied', token: null };
  }

  const Notifications = loadNotifications();
  if (!Notifications) {
    return { status: 'denied', token: null };
  }

  ensureHandler(Notifications);
  await ensureAndroidChannel(Notifications);

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
  if (isAndroidExpoGo()) {
    return getStoredPushToken();
  }

  const status = await getOsNotificationPermission();
  if (status !== 'granted' || !Device.isDevice) {
    return getStoredPushToken();
  }

  const Notifications = loadNotifications();
  if (!Notifications) {
    return getStoredPushToken();
  }

  try {
    await ensureAndroidChannel(Notifications);
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

export function canUseRemotePushInThisClient(): boolean {
  return !isAndroidExpoGo() && Platform.OS !== 'web';
}
