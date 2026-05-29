import {supabase} from '../supabase/client';

export const authService = {
  async signIn(email: string, password: string) {
    const {data, error} = await supabase.auth.signInWithPassword({email, password});
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, name: string) {
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {name},
        emailRedirectTo: undefined,
      },
    });
    if (error) throw error;
    // Insert profile — may already exist if email confirmation is off
    if (data.user) {
      await supabase.from('users').upsert({id: data.user.id, email, name}, {onConflict: 'id'});
    }
    return data;
  },

  async getProfile(userId: string) {
    const {data, error} = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },
};
