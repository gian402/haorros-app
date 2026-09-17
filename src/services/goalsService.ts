import {api, imageForm} from '../api/client';
import {poll} from '../api/poll';
import {Goal} from '../types';

export const goalsService = {
  async getMyGoals(_userId: string) {return api<Goal[]>('/goals');},
  async getGoal(goalId: string) {return api<Goal>('/goals/' + goalId);},
  async createGoal(payload: Omit<Goal, 'id' | 'created_at' | 'current_amount' | 'members'>) {
    return api<Goal>('/goals', 'POST', payload);
  },
  async uploadImage(goalId: string, uri: string) {
    const data = await api<{image_url: string}>('/goals/' + goalId + '/image', 'POST', imageForm(uri));
    return data.image_url;
  },
  async addMember(goalId: string, email: string) {await api('/goals/' + goalId + '/members', 'POST', {email});},
  async removeMember(memberId: string) {await api('/members/' + memberId, 'DELETE');},
  async updateGoal(goalId: string, fields: {title?: string; target_amount?: number}) {
    await api('/goals/' + goalId, 'PATCH', fields);
  },
  async deleteGoal(goalId: string) {await api('/goals/' + goalId, 'DELETE');},
  subscribeToGoal(goalId: string, onUpdate: (goal: Goal) => void) {
    return poll(() => goalsService.getGoal(goalId), onUpdate);
  },
};
