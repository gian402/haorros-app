import {supabase} from '../supabase/client';
import {Goal} from '../supabase/types';

export const goalsService = {
  async getMyGoals(userId: string): Promise<Goal[]> {
    // Metas propias
    const {data: owned, error: e1} = await supabase
      .from('goals')
      .select('*, members:goal_members(id, user_id, user:users(id, name, email))')
      .eq('owner_id', userId)
      .order('created_at', {ascending: false});
    if (e1) throw e1;

    // Metas donde soy miembro
    const {data: memberRows, error: e2} = await supabase
      .from('goal_members')
      .select('goal_id')
      .eq('user_id', userId);
    if (e2) throw e2;

    const memberGoalIds = (memberRows ?? []).map(r => r.goal_id);
    let shared: Goal[] = [];
    if (memberGoalIds.length > 0) {
      const {data, error: e3} = await supabase
        .from('goals')
        .select('*, members:goal_members(id, user_id, user:users(id, name, email))')
        .in('id', memberGoalIds)
        .order('created_at', {ascending: false});
      if (e3) throw e3;
      shared = data ?? [];
    }

    // Combinar sin duplicados
    const all = [...(owned ?? []), ...shared];
    const seen = new Set<string>();
    return all.filter(g => seen.has(g.id) ? false : (seen.add(g.id), true));
  },

  async getGoal(goalId: string): Promise<Goal> {
    const {data, error} = await supabase
      .from('goals')
      .select('*, members:goal_members(id, user_id, user:users(id, name, email))')
      .eq('id', goalId)
      .single();
    if (error) throw error;
    return data;
  },

  async createGoal(payload: Omit<Goal, 'id' | 'created_at' | 'current_amount' | 'members'>): Promise<Goal> {
    const {data, error} = await supabase
      .from('goals')
      .insert({...payload, current_amount: 0})
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadImage(goalId: string, uri: string): Promise<string> {
    const ext = (uri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
    const path = `goals/${goalId}.${ext}`;
    const formData = new FormData();
    formData.append('file', {uri, name: `${goalId}.${ext}`, type: `image/${ext}`} as unknown as Blob);
    const {error} = await supabase.storage
      .from('goal-images')
      .upload(path, formData, {upsert: true});
    if (error) throw error;
    const {data} = supabase.storage.from('goal-images').getPublicUrl(path);
    await supabase.from('goals').update({image_url: data.publicUrl}).eq('id', goalId);
    return data.publicUrl;
  },

  async addMember(goalId: string, userId: string) {
    const {error} = await supabase.from('goal_members').insert({goal_id: goalId, user_id: userId});
    if (error) throw error;
  },

  async removeMember(memberId: string) {
    const {error} = await supabase.from('goal_members').delete().eq('id', memberId);
    if (error) throw error;
  },

  async updateGoal(goalId: string, fields: {title?: string; target_amount?: number}) {
    const {error} = await supabase.from('goals').update(fields).eq('id', goalId);
    if (error) throw error;
  },

  async deleteGoal(goalId: string): Promise<void> {
    const {error} = await supabase.from('goals').delete().eq('id', goalId);
    if (error) throw error;
  },

  subscribeToGoal(goalId: string, onUpdate: (goal: Goal) => void) {
    return supabase
      .channel(`goal:${goalId}`)
      .on('postgres_changes', {event: '*', schema: 'public', table: 'goals', filter: `id=eq.${goalId}`}, payload => {
        onUpdate(payload.new as Goal);
      })
      .subscribe();
  },
};
