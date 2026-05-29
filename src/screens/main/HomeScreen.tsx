import React, {useEffect, useCallback} from 'react';
import {View, Text, FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../supabase/types';
import {useGoalsStore} from '../../store/goalsStore';
import {useAuthStore} from '../../store/authStore';
import {goalsService} from '../../services/goalsService';
import {GoalCard} from '../../components/GoalCard';

type Props = {navigation: NativeStackNavigationProp<HomeStackParamList, 'GoalList'>};

export function HomeScreen({navigation}: Props) {
  const {goals, setGoals} = useGoalsStore();
  const {session} = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      const data = await goalsService.getMyGoals(session.user.id);
      setGoals(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session, setGoals]);

  useEffect(() => {load();}, [load]);

  if (loading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-bg">
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16, paddingBottom: 32}}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">🎯</Text>
            <Text className="text-white text-lg font-bold">Sin metas aún</Text>
            <Text className="text-gray-400 text-sm mt-2">Crea tu primera meta de ahorro</Text>
          </View>
        }
        renderItem={({item}) => (
          <GoalCard
            goal={item}
            onPress={() => navigation.navigate('GoalDetail', {goalId: item.id})}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {setRefreshing(true); load();}}
            tintColor="#6C63FF"
          />
        }
      />
    </View>
  );
}
