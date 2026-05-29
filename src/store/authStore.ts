import {create} from 'zustand';
import {Session} from '@supabase/supabase-js';
import {User} from '../supabase/types';
import {supabase} from '../supabase/client';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  session: null,
  user: null,
  loading: true,

  setSession: session => set({session}),
  setUser: user => set({user}),

  signOut: async () => {
    await supabase.auth.signOut();
    set({session: null, user: null});
  },

  init: () => {
    supabase.auth.getSession().then(({data: {session}}) => {
      set({session, loading: false});
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({session, loading: false});
    });
  },
}));
