import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View, Text, ScrollView, Image, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal, StyleSheet, Animated, Vibration,
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
import {colors} from '../../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'GoalDetail'>;
  route: RouteProp<HomeStackParamList, 'GoalDetail'>;
};

// Simple confetti particle
function Confetti({visible}: {visible: boolean}) {
  const particles = useRef(
    Array.from({length: 18}, (_, i) => ({
      x: new Animated.Value(Math.random() * 300 - 150),
      y: new Animated.Value(-20),
      op: new Animated.Value(1),
      color: ['#D4AF37', '#F0D060', '#fff', '#FF4D6D', '#00C853'][i % 5],
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel(
      particles.map(p =>
        Animated.parallel([
          Animated.timing(p.y, {toValue: 500, duration: 1800, useNativeDriver: true}),
          Animated.timing(p.op, {toValue: 0, duration: 1800, delay: 800, useNativeDriver: true}),
        ])
      )
    ).start(() => particles.forEach(p => {p.y.setValue(-20); p.op.setValue(1);}));
  }, [visible]);

  if (!visible) return null;
  return (
    <View style={sf.overlay} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[sf.particle, {
            backgroundColor: p.color,
            left: '50%',
            transform: [{translateX: p.x}, {translateY: p.y}],
            opacity: p.op,
          }]}
        />
      ))}
    </View>
  );
}

function daysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export function GoalDetailScreen({navigation, route}: Props) {
  const {goalId} = route.params;
  const {activeGoal, setActiveGoal, updateGoal} = useGoalsStore();
  const {session} = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [confetti, setConfetti] = useState(false);
  // edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');

  const load = useCallback(async () => {
    try {
      const goal = await goalsService.getGoal(goalId);
      setActiveGoal(goal);
    } finally {setLoading(false);}
  }, [goalId, setActiveGoal]);

  useEffect(() => {
    load();
    const ch = goalsService.subscribeToGoal(goalId, g => {
      updateGoal(g);
      if (g.current_amount >= g.target_amount && g.target_amount > 0) setConfetti(true);
    });
    return () => {ch.unsubscribe();};
  }, [goalId, load, updateGoal]);

  const handleDelete = () => {
    Alert.alert('Eliminar meta', '¿Estás seguro? Esta acción no se puede deshacer.', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {await goalsService.deleteGoal(goalId); navigation.goBack();}
        catch (e: unknown) {Alert.alert('Error', e instanceof Error ? e.message : 'Error al eliminar');}
      }},
    ]);
  };

  const handleAdd = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {Alert.alert('Error', 'Monto inválido'); return;}
    if (!session?.user.id || !activeGoal) return;
    // Tarea 6: validar que no supere lo que falta
    const remaining = activeGoal.target_amount - activeGoal.current_amount;
    if (num > remaining) {
      Alert.alert('Monto excedido', `Solo faltan S/ ${remaining.toLocaleString()} para completar la meta`);
      return;
    }
    setAdding(true);
    try {
      await transactionsService.addAmount(goalId, session.user.id, num);
      Vibration.vibrate(60);
      await load();
      setAddModal(false); setAmount('');
      if (activeGoal.current_amount + num >= activeGoal.target_amount) setConfetti(true);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error');
    } finally {setAdding(false);}
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    try {
      const {supabase} = await import('../../supabase/client');
      const {data} = await supabase.from('users').select('id').eq('email', shareEmail.trim()).single();
      if (!data) {Alert.alert('Error', 'Usuario no encontrado'); return;}
      await goalsService.addMember(goalId, data.id);
      await load();
      Alert.alert('¡Listo!', 'Usuario agregado a la meta');
      setShareModal(false); setShareEmail('');
    } catch {Alert.alert('Error', 'No se pudo agregar');}
  };

  // Tarea 5: eliminar miembro
  const handleRemoveMember = (memberId: string, userId: string) => {
    if (userId === activeGoal?.owner_id) {Alert.alert('No permitido', 'No puedes eliminar al dueño'); return;}
    Alert.alert('Eliminar miembro', '¿Quitar a este miembro de la meta?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {await goalsService.removeMember(memberId); await load();}
        catch {Alert.alert('Error', 'No se pudo eliminar');}
      }},
    ]);
  };

  // Tarea 4: editar meta
  const openEdit = () => {
    setEditTitle(activeGoal?.title ?? '');
    setEditTarget(String(activeGoal?.target_amount ?? ''));
    setEditModal(true);
  };
  const handleEdit = async () => {
    if (!editTitle.trim()) return;
    const t = parseFloat(editTarget);
    if (!t || t <= 0) return;
    try {
      await goalsService.updateGoal(goalId, {title: editTitle.trim(), target_amount: t});
      await load(); setEditModal(false);
    } catch (e: unknown) {Alert.alert('Error', e instanceof Error ? e.message : 'Error');}
  };

  if (loading || !activeGoal) {
    return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const progress = activeGoal.target_amount > 0 ? (activeGoal.current_amount / activeGoal.target_amount) * 100 : 0;
  const days = activeGoal.deadline ? daysLeft(activeGoal.deadline) : null;

  return (
    <View style={s.flex}>
      <Confetti visible={confetti} />
      <ScrollView contentContainerStyle={s.content}>
        {activeGoal.image_url ? (
          <Image source={{uri: activeGoal.image_url}} style={s.image} resizeMode="cover" />
        ) : (
          <View style={s.imagePlaceholder}><Text style={s.placeholderEmoji}>🎯</Text></View>
        )}

        <View style={s.body}>
          <View style={s.titleRow}>
            <Text style={s.title}>{activeGoal.title}</Text>
            <TouchableOpacity onPress={openEdit} style={s.editBtn}>
              <Text style={s.editBtnText}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.meta}>Meta: S/ {activeGoal.target_amount.toLocaleString()}</Text>

          {days !== null && (
            <View style={[s.countdownBadge, days <= 7 && {backgroundColor: colors.danger + '22', borderColor: colors.danger + '66'}]}>
              <Text style={[s.countdownText, days <= 7 && {color: colors.danger}]}>
                {days > 0 ? `⏳ ${days} días restantes` : '⚠️ Plazo vencido'}
              </Text>
            </View>
          )}

          <View style={s.progressCard}>
            <ProgressBar progress={progress} current={activeGoal.current_amount} target={activeGoal.target_amount} />
          </View>

          {progress >= 100 && (
            <View style={s.completedBadge}>
              <Text style={s.completedText}>🎉 ¡Meta completada!</Text>
            </View>
          )}

          <View style={s.actions}>
            <View style={s.actionBtn}>
              <Button title="+ Agregar" onPress={() => setAddModal(true)} disabled={progress >= 100} />
            </View>
            <View style={s.actionBtn}>
              <Button title="Historial" onPress={() => navigation.navigate('History', {goalId})} variant="outline" />
            </View>
          </View>

          {/* Miembros */}
          <TouchableOpacity style={s.shareRow} onPress={() => setShareModal(true)}>
            <Text style={s.shareIcon}>👥</Text>
            <View style={s.shareInfo}>
              <Text style={s.shareTitle}>Compartir meta</Text>
              <Text style={s.shareSub}>{activeGoal.members?.length ?? 0} miembro(s)</Text>
            </View>
            <Text style={s.shareArrow}>›</Text>
          </TouchableOpacity>

          {(activeGoal.members?.length ?? 0) > 0 && (
            <View style={s.membersList}>
              {activeGoal.members!.map(m => (
                <View key={m.id} style={s.memberRow}>
                  <View style={s.memberAvatar}>
                    <Text style={s.memberAvatarText}>{(m.user?.name ?? 'U')[0].toUpperCase()}</Text>
                  </View>
                  <Text style={s.memberName}>{m.user?.name ?? m.user_id}</Text>
                  {m.user_id !== activeGoal.owner_id && session?.user.id === activeGoal.owner_id && (
                    <TouchableOpacity onPress={() => handleRemoveMember(m.id, m.user_id)}>
                      <Text style={s.removeMember}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
            <Text style={s.deleteTxt}>🗑  Eliminar meta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal agregar dinero */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Agregar dinero</Text>
            <Text style={s.sheetSub}>Falta: S/ {(activeGoal.target_amount - activeGoal.current_amount).toLocaleString()}</Text>
            <View style={s.quickBtns}>
              {[50, 100, 200].map(v => (
                <TouchableOpacity key={v} style={s.quickBtn} onPress={() => setAmount(String(v))}>
                  <Text style={s.quickBtnText}>+{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={s.sheetInput}
              placeholder="S/ 0.00"
              placeholderTextColor={colors.gray3}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <Button title="Confirmar" onPress={handleAdd} loading={adding} />
            <TouchableOpacity style={s.cancel} onPress={() => {setAddModal(false); setAmount('');}}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal compartir */}
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

      {/* Modal editar meta */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Editar meta</Text>
            <TextInput
              style={s.sheetInput}
              placeholder="Nombre de la meta"
              placeholderTextColor={colors.gray3}
              value={editTitle}
              onChangeText={setEditTitle}
            />
            <TextInput
              style={[s.sheetInput, {marginTop: 10}]}
              placeholder="Monto objetivo"
              placeholderTextColor={colors.gray3}
              keyboardType="decimal-pad"
              value={editTarget}
              onChangeText={setEditTarget}
            />
            <Button title="Guardar" onPress={handleEdit} />
            <TouchableOpacity style={s.cancel} onPress={() => setEditModal(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const sf = StyleSheet.create({
  overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999},
  particle: {position: 'absolute', width: 10, height: 10, borderRadius: 3, top: 100},
});

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  center: {flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center'},
  content: {paddingBottom: 40},
  image: {width: '100%', height: 220},
  imagePlaceholder: {width: '100%', height: 220, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center'},
  placeholderEmoji: {fontSize: 64},
  body: {padding: 20},
  titleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 4},
  title: {color: colors.white, fontSize: 26, fontWeight: '800', flex: 1},
  editBtn: {padding: 6},
  editBtnText: {fontSize: 20},
  meta: {color: colors.gray2, fontSize: 14, marginBottom: 12},
  countdownBadge: {
    backgroundColor: colors.primary + '22', borderWidth: 1, borderColor: colors.primary + '55',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 14,
  },
  countdownText: {color: colors.primary, fontWeight: '700', fontSize: 13},
  progressCard: {backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border},
  completedBadge: {
    backgroundColor: '#00C853' + '22', borderWidth: 1, borderColor: '#00C853' + '66',
    borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 16,
  },
  completedText: {color: '#00C853', fontWeight: '700', fontSize: 15},
  actions: {flexDirection: 'row', gap: 12, marginBottom: 16},
  actionBtn: {flex: 1},
  shareRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 12,
  },
  shareIcon: {fontSize: 24, marginRight: 12},
  shareInfo: {flex: 1},
  shareTitle: {color: colors.white, fontWeight: '600', fontSize: 15},
  shareSub: {color: colors.gray2, fontSize: 12, marginTop: 2},
  shareArrow: {color: colors.gray2, fontSize: 22},
  membersList: {backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12, overflow: 'hidden'},
  memberRow: {flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border},
  memberAvatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center', marginRight: 10},
  memberAvatarText: {color: colors.primary, fontWeight: '700'},
  memberName: {flex: 1, color: colors.white, fontSize: 14},
  removeMember: {color: colors.danger, fontSize: 16, paddingHorizontal: 8},
  deleteBtn: {
    marginTop: 8, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: colors.danger + '55',
    backgroundColor: colors.danger + '11', alignItems: 'center',
  },
  deleteTxt: {color: colors.danger, fontWeight: '700', fontSize: 15},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)'},
  sheet: {backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24},
  sheetTitle: {color: colors.white, fontSize: 20, fontWeight: '700', marginBottom: 4},
  sheetSub: {color: colors.gray2, fontSize: 13, marginBottom: 14},
  quickBtns: {flexDirection: 'row', gap: 10, marginBottom: 14},
  quickBtn: {flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary + '55', alignItems: 'center'},
  quickBtnText: {color: colors.primary, fontWeight: '700', fontSize: 15},
  sheetInput: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    color: colors.white, fontSize: 18, marginBottom: 16,
  },
  cancel: {marginTop: 12, alignItems: 'center'},
  cancelText: {color: colors.gray2, fontSize: 15},
});
