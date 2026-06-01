import React, {useEffect, useCallback, useState, useRef} from 'react';
import {View, Text, FlatList, RefreshControl, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {HomeStackParamList} from '../../supabase/types';
import {useGoalsStore} from '../../store/goalsStore';
import {useAuthStore} from '../../store/authStore';
import {goalsService} from '../../services/goalsService';
import {GoalCard} from '../../components/GoalCard';
import {useNetInfo} from '../../hooks/useNetInfo';
import {NoInternetBanner} from '../../components/NoInternetBanner';
import {colors} from '../../theme/colors';

type Props = {navigation: NativeStackNavigationProp<HomeStackParamList, 'GoalList'>};

function SkeletonCard() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {toValue: 1, duration: 700, useNativeDriver: true}),
        Animated.timing(anim, {toValue: 0.4, duration: 700, useNativeDriver: true}),
      ])
    ).start();
  }, [anim]);
  return (
    <Animated.View style={[sk.card, {opacity: anim}]}>
      <View style={sk.image} />
      <View style={sk.body}>
        <View style={sk.line1} />
        <View style={sk.line2} />
        <View style={sk.bar} />
      </View>
    </Animated.View>
  );
}

const sk = StyleSheet.create({
  card: {backgroundColor: colors.card, borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border},
  image: {width: '100%', height: 140, backgroundColor: colors.surface},
  body: {padding: 16, gap: 10},
  line1: {height: 16, width: '60%', backgroundColor: colors.surface, borderRadius: 8},
  line2: {height: 12, width: '40%', backgroundColor: colors.surface, borderRadius: 8},
  bar: {height: 8, width: '100%', backgroundColor: colors.surface, borderRadius: 8},
});

export function HomeScreen({navigation}: Props) {
  const {goals, setGoals} = useGoalsStore();
  const {session} = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isConnected = useNetInfo();

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      const data = await goalsService.getMyGoals(session.user.id);
      setGoals(data);
    } finally {setLoading(false); setRefreshing(false);}
  }, [session, setGoals]);

  useEffect(() => {load();}, [load]);
  useFocusEffect(useCallback(() => {load();}, [load]));

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);

  return (
    <View style={s.flex}>
      {!isConnected && <NoInternetBanner />}
      <FlatList
        data={loading ? [] : goals}
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
          loading ? (
            <View>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </View>
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyIllustration}>💰</Text>
              <Text style={s.emptyTitle}>Sin metas aún</Text>
              <Text style={s.emptySub}>Toca el botón + para crear{'\n'}tu primera meta de ahorro</Text>
            </View>
          )
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
  list: {padding: 16, paddingBottom: 32},
  header: {marginBottom: 20},
  statsCard: {
    backgroundColor: colors.primary,
    borderRadius: 20, padding: 20,
  },
  statsLabel: {color: 'rgba(0,0,0,0.6)', fontSize: 13, fontWeight: '600'},
  statsAmount: {color: '#000', fontSize: 34, fontWeight: '800', marginTop: 4, letterSpacing: -1},
  statsCount: {color: 'rgba(0,0,0,0.6)', fontSize: 13, marginTop: 4},
  empty: {alignItems: 'center', marginTop: 60},
  emptyIllustration: {fontSize: 72, marginBottom: 16},
  emptyTitle: {color: colors.white, fontSize: 20, fontWeight: '700'},
  emptySub: {color: colors.gray2, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 22},
});
