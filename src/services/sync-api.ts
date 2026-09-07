import type { SyncFlushResult, SyncMutation } from '@/types/sync';

export class OfflineError extends Error {
  constructor(message = 'Device is offline') {
    super(message);
    this.name = 'OfflineError';
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function flushMutations(
  mutations: SyncMutation[],
  isOnline: boolean
): Promise<SyncFlushResult> {
  if (!isOnline) {
    throw new OfflineError();
  }

  if (mutations.length === 0) {
    return { ackedIds: [], syncedAt: new Date().toISOString() };
  }

  await delay(450 + Math.min(mutations.length * 80, 400));

  return {
    ackedIds: mutations.map((mutation) => mutation.id),
    syncedAt: new Date().toISOString(),
  };
}
