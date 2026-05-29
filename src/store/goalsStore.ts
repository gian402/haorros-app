import {create} from 'zustand';
import {Goal, Transaction} from '../supabase/types';

interface GoalsState {
  goals: Goal[];
  activeGoal: Goal | null;
  transactions: Transaction[];
  setGoals: (goals: Goal[]) => void;
  setActiveGoal: (goal: Goal | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  updateGoal: (updated: Goal) => void;
  addTransaction: (tx: Transaction) => void;
}

export const useGoalsStore = create<GoalsState>(set => ({
  goals: [],
  activeGoal: null,
  transactions: [],

  setGoals: goals => set({goals}),
  setActiveGoal: goal => set({activeGoal: goal}),
  setTransactions: transactions => set({transactions}),

  updateGoal: updated =>
    set(state => ({
      goals: state.goals.map(g => (g.id === updated.id ? updated : g)),
      activeGoal: state.activeGoal?.id === updated.id ? updated : state.activeGoal,
    })),

  addTransaction: tx =>
    set(state => ({transactions: [tx, ...state.transactions]})),
}));
