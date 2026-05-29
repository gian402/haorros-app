export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  image_url: string | null;
  owner_id: string;
  created_at: string;
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

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  CreateGoal: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  GoalList: undefined;
  GoalDetail: {goalId: string};
  History: {goalId: string};
};
