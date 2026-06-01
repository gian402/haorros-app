import React, {useEffect, useCallback, useState, useRef} from 'react';
import {View, Text, FlatList, RefreshControl, StyleSheet, Animated} from 'react-native';
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
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {toValue: 0.8, duration: 800, useNativeDriver: true}),
        Animated.timing(anim, {toValue: 0.3, duration: 800, useNativeDriver: true}),
      ])
    ).start();
  }, [anim]);
  return (
    <Animated.View style={[sk.card, {opacity: anim}]}>
      <View style={sk.image} />
      <View style={sk.body}>
        <View style={sk.line1} /><View style={sk.line2} /><View style={sk.bar} />
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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export function HomeScreen({navigation}: Props) {
  const {goals, setGoals} = useGoalsStore();
  const {session} = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isConnected = useNetInfo();
  const headerAnim = useRef(new Animated.Value(0)).current;

  const name = session?.user.user_metadata?.name?.split(' ')[0] ?? 'Usuario';

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      const data = await goalsService.getMyGoals(session.user.id);
      setGoals(data);
    } finally {setLoading(false); setRefreshing(false);}
  }, [session, setGoals]);

  useEffect(() => {
    load();
    Animated.timing(headerAnim, {toValue: 1, duration: 600, useNativeDriver: true}).start();
  }, [load]);

  useFocusEffect(useCallback(() => {load();}, [load]));

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const completed = goals.filter(g => g.current_amount >= g.target_amount && g.target_amount > 0).length;

  const Header = (
    <Animated.View style={{opacity: headerAnim, transform: [{translateY: headerAnim.interpolate({inputRange:[0,1],outputRange:[20,0]})}]}}>
      {/* Saludo */}
      <View style={s.greetRow}>
        <View>
          <Text style={s.greetSub}>{greeting()} 👋</Text>
          <Text style={s.greetName}>{name}</Text>
        </View>
        <View style={s.greetBadge}>
          <Text style={s.greetBadgeText}>💰</Text>
        </View>
      </View>

      {/* Card stats premium */}
      <View style={s.statsCard}>
        {/* Decoración */}
        <View style={s.statsCircle1} />
        <View style={s.statsCircle2} />

        <Text style={s.statsLabel}>TOTAL AHORRADO</Text>
        <Text style={s.statsAmount}>S/ {totalSaved.toLocaleString('es-PE', {minimumFractionDigits: 2})}</Text>

        <View style={s.statsDivider} />

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statNum}>{goals.length}</Text>
            <Text style={s.statLbl}>Activas</Text>
          </View>
          <View style={s.statSep} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{completed}</Text>
            <Text style={s.statLbl}>Completadas</Text>
          </View>
          <View style={s.statSep} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{goals.length - completed}</Text>
            <Text style={s.statLbl}>En progreso</Text>
          </View>
        </View>
      </View>

      <Text style={s.sectionTitle}>Mis metas</Text>
    </Animated.View>
  );

  return (
    <View style={s.flex}>
      {!isConnected && <NoInternetBanner />}
      <FlatList
        data={loading ? [] : goals}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          loading ? (
            <View><SkeletonCard /><SkeletonCard /><SkeletonCard /></View>
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIconWrap}>
                <Text style={s.emptyIllustration}>🎯</Text>
              </View>
              <Text style={s.emptyTitle}>Sin metas aún</Text>
              <Text style={s.emptySub}>Toca el botón <Text style={{color: colors.primary}}>+</Text> para crear{'\n'}tu primera meta de ahorro</Text>
            </View>
          )
        }
        renderItem={({item, index}) => (
          <GoalCard goal={item} index={index} onPress={() => navigation.navigate('GoalDetail', {goalId: item.id})} />
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
  greetRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20},
  greetSub: {color: colors.gray2, fontSize: 13, fontWeight: '500'},
  greetName: {color: colors.white, fontSize: 24, fontWeight: '800', marginTop: 2},
  greetBadge: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: colors.primary + '20',
    borderWidth: 1, borderColor: colors.primary + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  greetBadgeText: {fontSize: 22},
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 24, padding: 22,
    borderWidth: 1, borderColor: colors.primary + '30',
    marginBottom: 24, overflow: 'hidden',
    shadowColor: colors.primary, shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 6,
  },
  statsCircle1: {
    position: 'absolute', top: -40, right: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: colors.primary + '10',
  },
  statsCircle2: {
    position: 'absolute', bottom: -30, left: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.primary + '08',
  },
  statsLabel: {color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 6},
  statsAmount: {color: colors.white, fontSize: 36, fontWeight: '800', letterSpacing: -1},
  statsDivider: {height: 1, backgroundColor: colors.border, marginVertical: 16},
  statsRow: {flexDirection: 'row', justifyContent: 'space-around'},
  statItem: {alignItems: 'center'},
  statNum: {color: colors.primary, fontSize: 22, fontWeight: '800'},
  statLbl: {color: colors.gray2, fontSize: 11, marginTop: 2},
  statSep: {width: 1, backgroundColor: colors.border},
  sectionTitle: {color: colors.white, fontSize: 18, fontWeight: '700', marginBottom: 14, letterSpacing: -0.3},
  empty: {alignItems: 'center', marginTop: 40},
  emptyIconWrap: {
    width: 100, height: 100, borderRadius: 30,
    backgroundColor: colors.primary + '15',
    borderWidth: 1, borderColor: colors.primary + '30',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyIllustration: {fontSize: 48},
  emptyTitle: {color: colors.white, fontSize: 20, fontWeight: '700'},
  emptySub: {color: colors.gray2, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 22},
});
