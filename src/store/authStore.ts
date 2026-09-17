import {create} from 'zustand';
import {User} from '../types';
import {api, ApiError, Session, onSessionChange, restoreSession, saveSession, updateSessionUser} from '../api/client';
import {useGoalsStore} from './goalsStore';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  init: () => void;
}
let initialized = false;
export const useAuthStore = create<AuthState>(set => ({
  session: null, user: null, loading: true,
  setSession: session => set({session, user: session?.user ?? null}),
  setUser: user => set({user}),
  signOut: async () => {
    try {await api('/auth/logout', 'POST');}
    finally {await saveSession(null);}
  },
  init: () => {
    if (initialized) return;
    initialized = true;
    onSessionChange(session => {
      set({session, user: session?.user ?? null, loading: false});
      if (!session) useGoalsStore.setState({goals: [], activeGoal: null, transactions: []});
    });
    (async () => {
      try {
        const session = await restoreSession();
        set({session, user: session?.user ?? null});
        if (session) {
          try {await updateSessionUser(await api<User>('/auth/me'));}
          catch (error) {
            if (error instanceof ApiError && error.status === 401) await saveSession(null);
          }
        }
      } finally {set({loading: false});}
    })().catch(() => set({session: null, user: null, loading: false}));
  },
}));
