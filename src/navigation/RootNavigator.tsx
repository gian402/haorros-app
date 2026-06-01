import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthStore} from '../store/authStore';
import {AuthNavigator} from './AuthNavigator';
import {MainNavigator} from './MainNavigator';
import {SplashScreen} from '../screens/auth/SplashScreen';
import {OnboardingScreen} from '../screens/auth/OnboardingScreen';
import {RootStackParamList} from '../supabase/types';
import {colors} from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Phase = 'splash' | 'onboarding' | 'app';

export function RootNavigator() {
  const {session, loading, init} = useAuthStore();
  const [phase, setPhase] = useState<Phase>('splash');

  useEffect(() => {init();}, [init]);

  const handleSplashDone = async () => {
    const seen = await AsyncStorage.getItem('onboarding_done');
    setPhase(seen ? 'app' : 'onboarding');
  };

  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    setPhase('app');
  };

  if (phase === 'splash') {
    return <SplashScreen onFinish={handleSplashDone} />;
  }

  if (phase === 'onboarding') {
    return <OnboardingScreen onFinish={handleOnboardingDone} />;
  }

  if (loading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {session ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
