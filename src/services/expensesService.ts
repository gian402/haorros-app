import {supabase} from '../supabase/client';
import {Expense} from '../supabase/types';

export const expensesService = {
  async getExpenses(userId: string): Promise<Expense[]> {
    const {data, error} = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {ascending: false});
    if (error) throw error;
    return data ?? [];
  },

  async addExpense(payload: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const {data, error} = await supabase
      .from('expenses')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    const {error} = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },
};
