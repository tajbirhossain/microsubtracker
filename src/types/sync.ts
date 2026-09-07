import type { Subscription } from '@/constants/dashboard';

export type SyncMutationType = 'create' | 'update' | 'cancel' | 'keep';

export type SyncMutation = {
  id: string;
  type: SyncMutationType;
  subscriptionId: string;
  payload?: Partial<Subscription>;
  createdAt: string;
};

export type SyncFlushResult = {
  ackedIds: string[];
  syncedAt: string;
};
