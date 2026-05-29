import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, ScrollView, Image, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {HomeStackParamList} from '../../supabase/types';
import {useGoalsStore} from '../../store/goalsStore';
import {useAuthStore} from '../../store/authStore';
import {goalsService} from '../../services/goalsService';
import {transactionsService} from '../../services/transactionsService';
import {ProgressBar} from '../../components/ProgressBar';
import {Button} from '../../components/Button';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'GoalDetail'>;
  route: RouteProp<HomeStackParamList, 'GoalDetail'>;
};

export function GoalDetailScreen({navigation, route}: Props) {
  const {goalId} = route.params;
  const {activeGoal, setActiveGoal, updateGoal} = useGoalsStore();
  const {session} = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareModal, setShareModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const goal = await goalsService.getGoal(goalId);
      setActiveGoal(goal);
    } finally {
      setLoading(false);
    }
  }, [goalId, setActiveGoal]);

  useEffect(() => {
    load();
    const channel = goalsService.subscribeToGoal(goalId, updated => {
      updateGoal(updated);
    });
    return () => {channel.unsubscribe();};
  }, [goalId, load, updateGoal]);

  const handleAddAmount = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {Alert.alert('Error', 'Ingresa un monto válido'); return;}
    if (!session?.user.id) return;
    setAdding(true);
    try {
      await transactionsService.addAmount(goalId, session.user.id, num);
      await load();
      setAddModal(false);
      setAmount('');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al agregar');
    } finally {
      setAdding(false);
    }
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    try {
      const {data} = await import('../../supabase/client').then(m =>
        m.supabase.from('users').select('id').eq('email', shareEmail.trim()).single()
      );
      if (!data) {Alert.alert('Error', 'Usuario no encontrado'); return;}
      await goalsService.addMember(goalId, data.id);
      Alert.alert('¡Listo!', 'Usuario agregado a la meta');
      setShareModal(false);
      setShareEmail('');
    } catch {
      Alert.alert('Error', 'No se pudo agregar el usuario');
    }
  };

  if (loading || !activeGoal) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  const progress = activeGoal.target_amount > 0
    ? (activeGoal.current_amount / activeGoal.target_amount) * 100
    : 0;

  return (
    <ScrollView className="flex-1 bg-dark-bg">
      {activeGoal.image_url ? (
        <Image source={{uri: activeGoal.image_url}} className="w-full h-52" resizeMode="cover" />
      ) : (
        <View className="w-full h-52 bg-dark-surface items-center justify-center">
          <Text className="text-6xl">🎯</Text>
        </View>
      )}

      <View className="p-6">
        <Text className="text-white text-2xl font-bold mb-1">{activeGoal.title}</Text>
        <Text className="text-gray-400 mb-6">Meta: S/ {activeGoal.target_amount.toLocaleString()}</Text>

        <View className="bg-dark-card rounded-2xl p-4 mb-6">
          <ProgressBar
            progress={progress}
            current={activeGoal.current_amount}
            target={activeGoal.target_amount}
          />
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <Button title="+ Agregar" onPress={() => setAddModal(true)} />
          </View>
          <View className="flex-1">
            <Button title="Historial" onPress={() => navigation.navigate('History', {goalId})} variant="outline" />
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center bg-dark-card rounded-2xl p-4"
          onPress={() => setShareModal(true)}>
          <Text className="text-primary text-lg mr-2">👥</Text>
          <Text className="text-white font-medium">Compartir meta</Text>
          <Text className="text-gray-400 ml-auto">
            {activeGoal.members?.length ?? 0} miembro(s)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal agregar monto */}
      <Modal visible={addModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-dark-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-4">Agregar dinero</Text>
            <TextInput
              className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white text-xl mb-4"
              placeholder="S/ 0.00"
              placeholderTextColor="#555577"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <Button title="Confirmar" onPress={handleAddAmount} loading={adding} />
            <TouchableOpacity className="mt-3 items-center" onPress={() => setAddModal(false)}>
              <Text className="text-gray-400">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal compartir */}
      <Modal visible={shareModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-dark-card rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-4">Compartir con</Text>
            <TextInput
              className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white mb-4"
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#555577"
              keyboardType="email-address"
              autoCapitalize="none"
              value={shareEmail}
              onChangeText={setShareEmail}
            />
            <Button title="Agregar" onPress={handleShare} />
            <TouchableOpacity className="mt-3 items-center" onPress={() => setShareModal(false)}>
              <Text className="text-gray-400">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
