import {api} from '../api/client';
import {Loan} from '../types';

export const loansService = {
  async getLoans(_userId: string) {return api<Loan[]>('/loans');},
  async addLoan(payload: Omit<Loan, 'id' | 'created_at'>) {return api<Loan>('/loans', 'POST', payload);},
  async markPaid(id: string) {await api('/loans/' + id + '/paid', 'PATCH');},
  async deleteLoan(id: string) {await api('/loans/' + id, 'DELETE');},
};
