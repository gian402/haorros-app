import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from '@react-native-vector-icons/feather';
import {MainTabParamList, HomeStackParamList} from '../supabase/types';
import {HomeScreen} from '../screens/main/HomeScreen';
import {GoalDetailScreen} from '../screens/main/GoalDetailScreen';
import {HistoryScreen} from '../screens/main/HistoryScreen';
import {CreateGoalScreen} from '../screens/main/CreateGoalScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';
import {colors} from '../theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const headerStyle = {
  headerStyle: {backgroundColor: colors.card},
  headerTintColor: colors.white,
  headerTitleStyle: {fontWeight: '700' as const, color: colors.white},
  headerShadowVisible: false,
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={headerStyle}>
      <HomeStack.Screen name="GoalList" component={HomeScreen} options={{title: 'Haorros 💰'}} />
      <HomeStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{title: 'Detalle'}} />
      <HomeStack.Screen name="History" component={HistoryScreen} options={{title: 'Historial'}} />
    </HomeStack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray3,
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
        tabBarIcon: ({color, size}) => {
          const icons: Record<string, string> = {Home: 'home', CreateGoal: 'plus-circle', Profile: 'user'};
          return <Icon name={(icons[route.name] ?? 'circle') as 'home'} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{tabBarLabel: 'Inicio'}} />
      <Tab.Screen name="CreateGoal" component={CreateGoalScreen}
        options={{tabBarLabel: 'Nueva Meta', headerShown: true, ...headerStyle, title: 'Nueva Meta'}} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{tabBarLabel: 'Perfil', headerShown: true, ...headerStyle, title: 'Mi Perfil'}} />
    </Tab.Navigator>
  );
}
