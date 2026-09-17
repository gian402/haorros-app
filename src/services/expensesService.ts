import {api} from '../api/client';
import {Expense} from '../types';

export const expensesService = {
  async getExpenses(_userId: string) {return api<Expense[]>('/expenses');},
  async addExpense(payload: Omit<Expense, 'id' | 'created_at'>) {return api<Expense>('/expenses', 'POST', payload);},
  async deleteExpense(id: string) {await api('/expenses/' + id, 'DELETE');},
};
