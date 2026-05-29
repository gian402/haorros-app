import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {HomeStackParamList, Transaction} from '../../supabase/types';
import {transactionsService} from '../../services/transactionsService';
import {useGoalsStore} from '../../store/goalsStore';

type Props = {route: RouteProp<HomeStackParamList, 'History'>};

function TransactionItem({tx}: {tx: Transaction}) {
  const date = new Date(tx.created_at).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  return (
    <View className="flex-row items-center bg-dark-card rounded-xl p-4 mb-3">
      <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
        <Text className="text-primary font-bold">+</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-medium">{tx.user?.name ?? 'Usuario'}</Text>
        <Text className="text-gray-400 text-xs">{date}</Text>
      </View>
      <Text className="text-accent font-bold text-base">S/ {tx.amount.toLocaleString()}</Text>
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
    } finally {
      setLoading(false);
    }
  }, [goalId, setTransactions]);

  useEffect(() => {
    load();
    const channel = transactionsService.subscribeToTransactions(goalId, tx => {
      addTransaction(tx);
    });
    return () => {channel.unsubscribe();};
  }, [goalId, load, addTransaction]);

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
        data={transactions}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16}}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-4xl mb-3">📋</Text>
            <Text className="text-white font-bold">Sin aportes aún</Text>
          </View>
        }
        renderItem={({item}) => <TransactionItem tx={item} />}
      />
    </View>
  );
}
