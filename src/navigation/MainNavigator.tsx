import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from '@react-native-vector-icons/feather';
import {MainTabParamList, MainStackParamList, HomeStackParamList} from '../supabase/types';
import {HomeScreen} from '../screens/main/HomeScreen';
import {GoalDetailScreen} from '../screens/main/GoalDetailScreen';
import {HistoryScreen} from '../screens/main/HistoryScreen';
import {CreateGoalScreen} from '../screens/main/CreateGoalScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';
import {ExpensesScreen} from '../screens/main/ExpensesScreen';
import {LoansScreen} from '../screens/main/LoansScreen';
import {colors} from '../theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const headerOpts = {
  headerStyle: {backgroundColor: colors.card},
  headerTintColor: colors.primary,
  headerTitleStyle: {fontWeight: '700' as const, color: colors.white},
  headerShadowVisible: false,
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={headerOpts}>
      <HomeStack.Screen name="GoalList" component={HomeScreen} options={{title: 'Haorros 💰'}} />
      <HomeStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{title: 'Detalle'}} />
      <HomeStack.Screen name="History" component={HistoryScreen} options={{title: 'Historial'}} />
    </HomeStack.Navigator>
  );
}

function PlaceholderScreen() { return <View style={{flex: 1, backgroundColor: colors.bg}} />; }

function FABTabButton() {
  const nav = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  return (
    <TouchableOpacity
      style={s.fab}
      onPress={() => nav.navigate('CreateGoal')}
      activeOpacity={0.85}>
      <Text style={s.fabIcon}>+</Text>
    </TouchableOpacity>
  );
}

function TabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.primary + '40',
          borderTopWidth: 1.5,
          paddingBottom: 8,
          paddingTop: 6,
          height: 62,
          shadowColor: colors.primary,
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray3,
        tabBarLabelStyle: {fontSize: 10, fontWeight: '600'},
        tabBarShowLabel: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({color, size}) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Gastos',
          headerShown: true,
          ...headerOpts,
          title: 'Gastos 💸',
          tabBarIcon: ({color, size}) => <Icon name="trending-down" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="NewGoal"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: () => (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <FABTabButton />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Loans"
        component={LoansScreen}
        options={{
          tabBarLabel: 'Préstamos',
          headerShown: true,
          ...headerOpts,
          title: 'Préstamos 🤝',
          tabBarIcon: ({color, size}) => <Icon name="credit-card" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          headerShown: true,
          ...headerOpts,
          title: 'Mi Perfil',
          tabBarIcon: ({color, size}) => <Icon name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{headerShown: false}}>
      <MainStack.Screen name="Tabs" component={TabsNavigator} />
      <MainStack.Screen
        name="CreateGoal"
        component={CreateGoalScreen}
        options={{
          headerShown: true,
          ...headerOpts,
          title: 'Nueva Meta',
          presentation: 'modal',
        }}
      />
    </MainStack.Navigator>
  );
}

const s = StyleSheet.create({
  fab: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {color: '#000', fontSize: 28, fontWeight: '700', lineHeight: 32},
});
