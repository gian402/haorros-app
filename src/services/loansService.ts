import {supabase} from '../supabase/client';
import {Loan} from '../supabase/types';

export const loansService = {
  async getLoans(userId: string): Promise<Loan[]> {
    const {data, error} = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {ascending: false});
    if (error) throw error;
    return data ?? [];
  },

  async addLoan(payload: Omit<Loan, 'id' | 'created_at'>): Promise<Loan> {
    const {data, error} = await supabase
      .from('loans')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markPaid(id: string): Promise<void> {
    const {error} = await supabase.from('loans').update({paid: true}).eq('id', id);
    if (error) throw error;
  },

  async deleteLoan(id: string): Promise<void> {
    const {error} = await supabase.from('loans').delete().eq('id', id);
    if (error) throw error;
  },
};
