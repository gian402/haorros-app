import {supabase} from '../supabase/client';
import {Transaction} from '../supabase/types';

export const transactionsService = {
  async addAmount(goalId: string, userId: string, amount: number): Promise<Transaction> {
    const {error: txError, data: tx} = await supabase
      .from('transactions')
      .insert({goal_id: goalId, user_id: userId, amount})
      .select('*, user:users(id, name, email)')
      .single();
    if (txError) throw txError;

    const {error: updateError} = await supabase.rpc('increment_goal_amount', {
      goal_id: goalId,
      increment: amount,
    });
    if (updateError) throw updateError;

    return tx;
  },

  async getHistory(goalId: string): Promise<Transaction[]> {
    const {data, error} = await supabase
      .from('transactions')
      .select('*, user:users(id, name, email)')
      .eq('goal_id', goalId)
      .order('created_at', {ascending: false});
    if (error) throw error;
    return data ?? [];
  },

  subscribeToTransactions(goalId: string, onNew: (tx: Transaction) => void) {
    return supabase
      .channel(`transactions:${goalId}`)
      .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'transactions', filter: `goal_id=eq.${goalId}`}, payload => {
        onNew(payload.new as Transaction);
      })
      .subscribe();
  },
};
