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

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#1A1A2E'},
        headerTintColor: '#fff',
        headerTitleStyle: {fontWeight: '700'},
      }}>
      <HomeStack.Screen name="GoalList" component={HomeScreen} options={{title: 'Haorros'}} />
      <HomeStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{title: 'Meta'}} />
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
          backgroundColor: '#1A1A2E',
          borderTopColor: '#2A2A4A',
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#555577',
        tabBarIcon: ({color, size}) => {
          const icons: Record<string, string> = {
            Home: 'home',
            CreateGoal: 'plus-circle',
            Profile: 'user',
          };
          return <Icon name={(icons[route.name] ?? 'circle') as 'home'} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{tabBarLabel: 'Inicio'}} />
      <Tab.Screen name="CreateGoal" component={CreateGoalScreen} options={{tabBarLabel: 'Nueva Meta', headerShown: true, headerStyle: {backgroundColor: '#1A1A2E'}, headerTintColor: '#fff', title: 'Nueva Meta'}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel: 'Perfil', headerShown: true, headerStyle: {backgroundColor: '#1A1A2E'}, headerTintColor: '#fff', title: 'Perfil'}} />
    </Tab.Navigator>
  );
}
