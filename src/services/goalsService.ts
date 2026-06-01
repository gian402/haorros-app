import {supabase} from '../supabase/client';
import {Goal} from '../supabase/types';

export const goalsService = {
  async getMyGoals(userId: string): Promise<Goal[]> {
    // Query goals SIN JOIN a goal_members (evita recursión RLS)
    const {data: owned, error: e1} = await supabase
      .from('goals')
      .select('id, title, target_amount, current_amount, image_url, owner_id, created_at, category, deadline')
      .eq('owner_id', userId)
      .order('created_at', {ascending: false});
    if (e1) throw e1;

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
        .select('id, title, target_amount, current_amount, image_url, owner_id, created_at, category, deadline')
        .in('id', memberGoalIds)
        .order('created_at', {ascending: false});
      if (e3) throw e3;
      shared = data ?? [];
    }

    const all = [...(owned ?? []), ...shared];
    const seen = new Set<string>();
    const unique = all.filter(g => seen.has(g.id) ? false : (seen.add(g.id), true));

    // Cargar members por separado para cada meta
    const withMembers = await Promise.all(unique.map(async g => {
      const {data: members} = await supabase
        .from('goal_members')
        .select('id, user_id, user:users(id, name, email)')
        .eq('goal_id', g.id);
      return {...g, members: members ?? []};
    }));
    return withMembers;
  },

  async getGoal(goalId: string): Promise<Goal> {
    const {data, error} = await supabase
      .from('goals')
      .select('id, title, target_amount, current_amount, image_url, owner_id, created_at, category, deadline')
      .eq('id', goalId)
      .single();
    if (error) throw error;
    const {data: members} = await supabase
      .from('goal_members')
      .select('id, user_id, user:users(id, name, email)')
      .eq('goal_id', goalId);
    return {...data, members: members ?? []};
  },

  async createGoal(payload: Omit<Goal, 'id' | 'created_at' | 'current_amount' | 'members'>): Promise<Goal> {
    // INSERT sin .select() para evitar que goals_select consulte goal_members (recursión)
    const {error} = await supabase
      .from('goals')
      .insert({...payload, current_amount: 0});
    if (error) throw error;
    // Obtener la meta recién creada por owner_id + title (evita JOIN a goal_members)
    const {data, error: e2} = await supabase
      .from('goals')
      .select('id, title, target_amount, current_amount, image_url, owner_id, created_at, category, deadline')
      .eq('owner_id', payload.owner_id)
      .eq('title', payload.title)
      .order('created_at', {ascending: false})
      .limit(1)
      .single();
    if (e2) throw e2;
    return {...data, members: []};
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
