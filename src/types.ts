export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  image_url: string | null;
  owner_id: string;
  created_at: string;
  deadline?: string | null;
  category?: string | null;
  members?: GoalMember[];
}

export interface GoalMember {
  id: string;
  goal_id: string;
  user_id: string;
  user?: User;
}

export interface Transaction {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  user?: User;
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category?: string | null;
  created_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  paid: boolean;
  created_at: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Stack principal que envuelve tabs + CreateGoal como modal
export type MainStackParamList = {
  Tabs: undefined;
  CreateGoal: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  NewGoal: undefined;
  Loans: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  GoalList: undefined;
  GoalDetail: {goalId: string};
  History: {goalId: string};
};
