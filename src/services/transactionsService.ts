import {api} from '../api/client';
import {poll} from '../api/poll';
import {Transaction} from '../types';

// This identifier is only an idempotency key, never an authentication secret.
export function newRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });
}
export const transactionsService = {
  async addAmount(goalId: string, _userId: string, amount: number, requestId: string): Promise<Transaction> {
    return api<Transaction>('/goals/' + goalId + '/transactions', 'POST', {amount, request_id: requestId});
  },
  async getHistory(goalId: string) {return api<Transaction[]>('/goals/' + goalId + '/transactions');},
  subscribeToTransactions(goalId: string, onUpdate: (transactions: Transaction[]) => void) {
    return poll(() => transactionsService.getHistory(goalId), onUpdate);
  },
};
