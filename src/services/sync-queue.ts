import type { Subscription } from '@/constants/dashboard';
import type { SyncMutation, SyncMutationType } from '@/types/sync';

function newMutationId() {
  return `mut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMutation(
  type: SyncMutationType,
  subscriptionId: string,
  payload?: Partial<Subscription>
): SyncMutation {
  return {
    id: newMutationId(),
    type,
    subscriptionId,
    payload,
    createdAt: new Date().toISOString(),
  };
}

export function enqueueMutation(queue: SyncMutation[], next: SyncMutation): SyncMutation[] {
  let working = [...queue];

  if (next.type === 'update') {
    working = working.filter(
      (item) => !(item.subscriptionId === next.subscriptionId && item.type === 'update')
    );
  }

  if (next.type === 'cancel') {
    working = working.filter(
      (item) =>
        !(
          item.subscriptionId === next.subscriptionId &&
          (item.type === 'update' || item.type === 'keep')
        )
    );
  }

  if (next.type === 'keep') {
    working = working.filter(
      (item) => !(item.subscriptionId === next.subscriptionId && item.type === 'keep')
    );
  }

  if (next.type === 'create') {
    const existingCreate = working.find(
      (item) => item.subscriptionId === next.subscriptionId && item.type === 'create'
    );
    if (existingCreate) {
      return working.map((item) =>
        item.id === existingCreate.id ? { ...next, id: existingCreate.id } : item
      );
    }
  }

  return [...working, next];
}

export function removeAcked(queue: SyncMutation[], ackedIds: string[]): SyncMutation[] {
  const acked = new Set(ackedIds);
  return queue.filter((item) => !acked.has(item.id));
}
