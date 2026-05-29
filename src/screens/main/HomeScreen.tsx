import React, {useEffect, useCallback, useState} from 'react';
import {View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../supabase/types';
import {useGoalsStore} from '../../store/goalsStore';
import {useAuthStore} from '../../store/authStore';
import {goalsService} from '../../services/goalsService';
import {GoalCard} from '../../components/GoalCard';
import {colors} from '../../theme/colors';

type Props = {navigation: NativeStackNavigationProp<HomeStackParamList, 'GoalList'>};

export function HomeScreen({navigation}: Props) {
  const {goals, setGoals} = useGoalsStore();
  const {session} = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      const data = await goalsService.getMyGoals(session.user.id);
      setGoals(data);
    } finally {setLoading(false); setRefreshing(false);}
  }, [session, setGoals]);

  useEffect(() => {load();}, [load]);

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);

  return (
    <View style={s.flex}>
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <View style={s.header}>
            <View style={s.statsCard}>
              <Text style={s.statsLabel}>Total ahorrado</Text>
              <Text style={s.statsAmount}>S/ {totalSaved.toLocaleString()}</Text>
              <Text style={s.statsCount}>{goals.length} meta{goals.length !== 1 ? 's' : ''} activa{goals.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🎯</Text>
            <Text style={s.emptyTitle}>Sin metas aún</Text>
            <Text style={s.emptySub}>Crea tu primera meta de ahorro</Text>
          </View>
        }
        renderItem={({item}) => (
          <GoalCard goal={item} onPress={() => navigation.navigate('GoalDetail', {goalId: item.id})} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor={colors.primary} />
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  center: {flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center'},
  list: {padding: 16, paddingBottom: 32},
  header: {marginBottom: 20},
  statsCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
  },
  statsLabel: {color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600'},
  statsAmount: {color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 4, letterSpacing: -1},
  statsCount: {color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4},
  empty: {alignItems: 'center', marginTop: 60},
  emptyIcon: {fontSize: 56, marginBottom: 12},
  emptyTitle: {color: colors.white, fontSize: 18, fontWeight: '700'},
  emptySub: {color: colors.gray2, fontSize: 14, marginTop: 6},
});
