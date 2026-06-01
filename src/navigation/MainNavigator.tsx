import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
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
  headerTintColor: colors.primary,
  headerTitleStyle: {fontWeight: '700' as const, color: colors.white},
  headerShadowVisible: false,
};

function FABButton({onPress}: {onPress: () => void}) {
  return (
    <TouchableOpacity style={fab.btn} onPress={onPress} activeOpacity={0.85}>
      <Text style={fab.icon}>+</Text>
    </TouchableOpacity>
  );
}

const fab = StyleSheet.create({
  btn: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  icon: {color: '#000', fontSize: 30, fontWeight: '700', lineHeight: 34},
});

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={headerStyle}>
      <HomeStack.Screen name="GoalList" component={HomeScreen} options={{title: 'Haorros 💰'}} />
      <HomeStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{title: 'Detalle'}} />
      <HomeStack.Screen name="History" component={HistoryScreen} options={{title: 'Historial'}} />
    </HomeStack.Navigator>
  );
}

// Pantalla vacía para el tab del FAB (nunca se muestra)
function EmptyScreen() {return <View />;}

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
          const icons: Record<string, string> = {Home: 'home', Profile: 'user', CreateGoal: 'plus'};
          return <Icon name={(icons[route.name] ?? 'circle') as 'home'} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{tabBarLabel: 'Inicio'}} />
      <Tab.Screen
        name="CreateGoal"
        component={EmptyScreen}
        options={({navigation}) => ({
          tabBarLabel: '',
          tabBarButton: () => (
            <FABButton onPress={() => navigation.navigate('CreateGoal')} />
          ),
          headerShown: true,
          ...headerStyle,
          title: 'Nueva Meta',
        })}
        listeners={({navigation}) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('CreateGoal');
          },
        })}
      />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{tabBarLabel: 'Perfil', headerShown: true, ...headerStyle, title: 'Mi Perfil'}} />
    </Tab.Navigator>
  );
}
