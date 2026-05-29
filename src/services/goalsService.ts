import {supabase} from '../supabase/client';
import {Goal} from '../supabase/types';

export const goalsService = {
  async getMyGoals(userId: string): Promise<Goal[]> {
    const {data, error} = await supabase
      .from('goals')
      .select('*, members:goal_members(id, user_id, user:users(id, name, email))')
      .or(`owner_id.eq.${userId},goal_members.user_id.eq.${userId}`)
      .order('created_at', {ascending: false});
    if (error) throw error;
    return data ?? [];
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
    const ext = (uri.split('.').pop() ?? 'jpg').toLowerCase().replace(/\?.*/, '');
    const path = `goals/${goalId}.${ext}`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const {error} = await supabase.storage
      .from('goal-images')
      .upload(path, blob, {contentType: `image/${ext}`, upsert: true});
    if (error) throw error;
    const {data} = supabase.storage.from('goal-images').getPublicUrl(path);
    // Update goal image_url in DB
    await supabase.from('goals').update({image_url: data.publicUrl}).eq('id', goalId);
    return data.publicUrl;
  },

  async addMember(goalId: string, userId: string) {
    const {error} = await supabase.from('goal_members').insert({goal_id: goalId, user_id: userId});
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
