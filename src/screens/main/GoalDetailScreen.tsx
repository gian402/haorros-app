import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, ScrollView, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {HomeStackParamList} from '../../supabase/types';
import {useGoalsStore} from '../../store/goalsStore';
import {useAuthStore} from '../../store/authStore';
import {goalsService} from '../../services/goalsService';
import {transactionsService} from '../../services/transactionsService';
import {ProgressBar} from '../../components/ProgressBar';
import {Button} from '../../components/Button';
import {colors} from '../../theme/colors';

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
  const [shareModal, setShareModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const goal = await goalsService.getGoal(goalId);
      setActiveGoal(goal);
    } finally {setLoading(false);}
  }, [goalId, setActiveGoal]);

  useEffect(() => {
    load();
    const ch = goalsService.subscribeToGoal(goalId, updateGoal);
    return () => {ch.unsubscribe();};
  }, [goalId, load, updateGoal]);

  const handleDelete = () => {
    Alert.alert('Eliminar meta', '¿Estás seguro? Esta acción no se puede deshacer.', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await goalsService.deleteGoal(goalId);
          navigation.goBack();
        } catch (e: unknown) {
          Alert.alert('Error', e instanceof Error ? e.message : 'Error al eliminar');
        }
      }},
    ]);
  };

  const handleAdd = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {Alert.alert('Error', 'Monto inválido'); return;}
    if (!session?.user.id) return;
    setAdding(true);
    try {
      await transactionsService.addAmount(goalId, session.user.id, num);
      await load();
      setAddModal(false); setAmount('');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error');
    } finally {setAdding(false);}
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    try {
      const {data} = await import('../../supabase/client').then(m =>
        m.supabase.from('users').select('id').eq('email', shareEmail.trim()).single()
      );
      if (!data) {Alert.alert('Error', 'Usuario no encontrado'); return;}
      await goalsService.addMember(goalId, data.id);
      Alert.alert('¡Listo!', 'Usuario agregado');
      setShareModal(false); setShareEmail('');
    } catch {Alert.alert('Error', 'No se pudo agregar');}
  };

  if (loading || !activeGoal) {
    return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const progress = activeGoal.target_amount > 0 ? (activeGoal.current_amount / activeGoal.target_amount) * 100 : 0;

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.content}>
      {activeGoal.image_url ? (
        <Image source={{uri: activeGoal.image_url}} style={s.image} resizeMode="cover" />
      ) : (
        <View style={s.imagePlaceholder}><Text style={s.placeholderEmoji}>🎯</Text></View>
      )}

      <View style={s.body}>
        <Text style={s.title}>{activeGoal.title}</Text>
        <Text style={s.meta}>Meta: S/ {activeGoal.target_amount.toLocaleString()}</Text>

        <View style={s.progressCard}>
          <ProgressBar progress={progress} current={activeGoal.current_amount} target={activeGoal.target_amount} />
        </View>

        <View style={s.actions}>
          <View style={s.actionBtn}>
            <Button title="+ Agregar" onPress={() => setAddModal(true)} />
          </View>
          <View style={s.actionBtn}>
            <Button title="Historial" onPress={() => navigation.navigate('History', {goalId})} variant="outline" />
          </View>
        </View>

        <TouchableOpacity style={s.shareRow} onPress={() => setShareModal(true)}>
          <Text style={s.shareIcon}>👥</Text>
          <View style={s.shareInfo}>
            <Text style={s.shareTitle}>Compartir meta</Text>
            <Text style={s.shareSub}>{activeGoal.members?.length ?? 0} miembro(s)</Text>
          </View>
          <Text style={s.shareArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
          <Text style={s.deleteTxt}>🗑  Eliminar meta</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={addModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Agregar dinero</Text>
            <TextInput
              style={s.sheetInput}
              placeholder="S/ 0.00"
              placeholderTextColor={colors.gray3}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <Button title="Confirmar" onPress={handleAdd} loading={adding} />
            <TouchableOpacity style={s.cancel} onPress={() => setAddModal(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={shareModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Compartir con</Text>
            <TextInput
              style={s.sheetInput}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.gray3}
              keyboardType="email-address"
              autoCapitalize="none"
              value={shareEmail}
              onChangeText={setShareEmail}
            />
            <Button title="Agregar" onPress={handleShare} />
            <TouchableOpacity style={s.cancel} onPress={() => setShareModal(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  center: {flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center'},
  content: {paddingBottom: 40},
  image: {width: '100%', height: 220},
  imagePlaceholder: {width: '100%', height: 220, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center'},
  placeholderEmoji: {fontSize: 64},
  body: {padding: 20},
  title: {color: colors.white, fontSize: 26, fontWeight: '800', marginBottom: 4},
  meta: {color: colors.gray2, fontSize: 14, marginBottom: 20},
  progressCard: {backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border},
  actions: {flexDirection: 'row', gap: 12, marginBottom: 20},
  actionBtn: {flex: 1},
  shareRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  shareIcon: {fontSize: 24, marginRight: 12},
  shareInfo: {flex: 1},
  shareTitle: {color: colors.white, fontWeight: '600', fontSize: 15},
  shareSub: {color: colors.gray2, fontSize: 12, marginTop: 2},
  shareArrow: {color: colors.gray2, fontSize: 22},
  deleteBtn: {
    marginTop: 16, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: colors.danger + '55',
    backgroundColor: colors.danger + '11', alignItems: 'center',
  },
  deleteTxt: {color: colors.danger, fontWeight: '700', fontSize: 15},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)'},
  sheet: {backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24},
  sheetTitle: {color: colors.white, fontSize: 20, fontWeight: '700', marginBottom: 16},
  sheetInput: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    color: colors.white, fontSize: 18, marginBottom: 16,
  },
  cancel: {marginTop: 12, alignItems: 'center'},
  cancelText: {color: colors.gray2, fontSize: 15},
});
