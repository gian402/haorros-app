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
      options: {data: {name}},
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from('users').insert({id: data.user.id, email, name});
    }
    return data;
  },

  async getProfile(userId: string) {
    const {data, error} = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },
};
