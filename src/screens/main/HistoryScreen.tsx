import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, ActivityIndicator, StyleSheet} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {HomeStackParamList, Transaction} from '../../supabase/types';
import {transactionsService} from '../../services/transactionsService';
import {useGoalsStore} from '../../store/goalsStore';
import {colors} from '../../theme/colors';

type Props = {route: RouteProp<HomeStackParamList, 'History'>};

function TxItem({tx}: {tx: Transaction}) {
  const date = new Date(tx.created_at).toLocaleDateString('es-PE', {day: '2-digit', month: 'short', year: 'numeric'});
  return (
    <View style={s.item}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{(tx.user?.name ?? 'U')[0].toUpperCase()}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>{tx.user?.name ?? 'Usuario'}</Text>
        <Text style={s.date}>{date}</Text>
      </View>
      <Text style={s.amount}>+S/ {tx.amount.toLocaleString()}</Text>
    </View>
  );
}

export function HistoryScreen({route}: Props) {
  const {goalId} = route.params;
  const {transactions, setTransactions, addTransaction} = useGoalsStore();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await transactionsService.getHistory(goalId);
      setTransactions(data);
    } finally {setLoading(false);}
  }, [goalId, setTransactions]);

  useEffect(() => {
    load();
    const ch = transactionsService.subscribeToTransactions(goalId, addTransaction);
    return () => {ch.unsubscribe();};
  }, [goalId, load, addTransaction]);

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={s.flex}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyText}>Sin aportes aún</Text>
          </View>
        }
        renderItem={({item}) => <TxItem tx={item} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  center: {flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center'},
  list: {padding: 16},
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary + '33',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: {color: colors.primary, fontWeight: '700', fontSize: 18},
  info: {flex: 1},
  name: {color: colors.white, fontWeight: '600', fontSize: 15},
  date: {color: colors.gray2, fontSize: 12, marginTop: 2},
  amount: {color: colors.accent, fontWeight: '700', fontSize: 16},
  empty: {alignItems: 'center', marginTop: 60},
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyText: {color: colors.gray2, fontSize: 16},
});
