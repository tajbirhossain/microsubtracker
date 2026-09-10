import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RatesMap } from '@/constants/currency';
import { MOCK_SUBSCRIPTIONS, type Subscription } from '@/constants/dashboard';
import type { SyncMutation } from '@/types/sync';

export type StoredParserConsent = 'unknown' | 'allowed' | 'denied';

export type StoredCurrencyRates = {
  base: string;
  rates: RatesMap;
  fetchedAt: string;
  source: string;
  stale: boolean;
  fallback: boolean;
};

const KEYS = {
  subscriptions: 'mst.subscriptions.v1',
  syncQueue: 'mst.syncQueue.v1',
  parserConsent: 'mst.parserConsent.v1',
  currencyRates: 'mst.currencyRates.v1',
} as const;

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadSubscriptions(): Promise<Subscription[]> {
  const stored = await readJson<Subscription[]>(KEYS.subscriptions);
  if (!stored) {
    await writeJson(KEYS.subscriptions, []);
    return [];
  }
  return stored;
}

export async function saveSubscriptions(subscriptions: Subscription[]): Promise<void> {
  await writeJson(KEYS.subscriptions, subscriptions);
}

export async function clearDemoSubscriptions(): Promise<void> {
  await writeJson(KEYS.subscriptions, []);
}

export async function seedDemoSubscriptions(): Promise<Subscription[]> {
  const seeded = MOCK_SUBSCRIPTIONS.map((sub) => ({ ...sub }));
  await writeJson(KEYS.subscriptions, seeded);
  return seeded;
}

export async function loadSyncQueue(): Promise<SyncMutation[]> {
  return (await readJson<SyncMutation[]>(KEYS.syncQueue)) ?? [];
}

export async function saveSyncQueue(queue: SyncMutation[]): Promise<void> {
  await writeJson(KEYS.syncQueue, queue);
}

export async function loadParserConsent(): Promise<StoredParserConsent> {
  return (await readJson<StoredParserConsent>(KEYS.parserConsent)) ?? 'unknown';
}

export async function saveParserConsent(status: StoredParserConsent): Promise<void> {
  await writeJson(KEYS.parserConsent, status);
}

export async function loadCurrencyRates(): Promise<StoredCurrencyRates | null> {
  return readJson<StoredCurrencyRates>(KEYS.currencyRates);
}

export async function saveCurrencyRates(bundle: StoredCurrencyRates): Promise<void> {
  await writeJson(KEYS.currencyRates, bundle);
}
