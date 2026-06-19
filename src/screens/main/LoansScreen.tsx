import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import {colors} from '../../theme/colors';
import {loansService} from '../../services/loansService';
import {useAuthStore} from '../../store/authStore';
import {Loan} from '../../supabase/types';

export function LoansScreen() {
  const session = useAuthStore(s => s.session);
  const userId = session?.user?.id;
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setLoans(await loansService.getLoans(userId));
    } catch (e: any) {
      Alert.alert('Error al cargar', e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const pending = loans.filter(l => !l.paid).reduce((sum, l) => sum + l.amount, 0);
  const paid = loans.filter(l => l.paid).reduce((sum, l) => sum + l.amount, 0);

  const handleAdd = async () => {
    const num = parseFloat(amount.replace(',', '.'));
    if (!desc.trim() || isNaN(num) || num <= 0) {
      Alert.alert('Datos inválidos', 'Ingresa una descripción y un monto mayor a 0.');
      return;
    }
    if (!userId) { Alert.alert('Error', 'No hay sesión activa.'); return; }
    setSaving(true);
    try {
      const newLoan = await loansService.addLoan({
        user_id: userId,
        description: desc.trim(),
        amount: num,
        paid: false,
      });
      setLoans(prev => [newLoan, ...prev]);
      setDesc('');
      setAmount('');
    } catch (e: any) {
      Alert.alert('Error al guardar', e.message ?? JSON.stringify(e));
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = (id: string) => {
    Alert.alert('Marcar pagado', '¿Este préstamo ya fue pagado?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Sí, pagado', onPress: async () => {
          try {
            await loansService.markPaid(id);
            setLoans(prev => prev.map(l => l.id === id ? {...l, paid: true} : l));
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este préstamo?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await loansService.deleteLoan(id);
            setLoans(prev => prev.filter(l => l.id !== id));
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Resumen */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, {borderColor: colors.danger + '60'}]}>
            <Text style={s.summaryLabel}>Por pagar</Text>
            <Text style={[s.summaryAmt, {color: colors.danger}]}>-${pending.toFixed(2)}</Text>
          </View>
          <View style={[s.summaryCard, {borderColor: colors.success + '60'}]}>
            <Text style={s.summaryLabel}>Pagado</Text>
            <Text style={[s.summaryAmt, {color: colors.success}]}>${paid.toFixed(2)}</Text>
          </View>
        </View>

        {/* Formulario */}
        <View style={s.form}>
          <Text style={s.formTitle}>Nuevo préstamo</Text>
          <TextInput
            style={s.input}
            placeholder="¿A quién le presté / para qué?"
            placeholderTextColor="#666"
            value={desc}
            onChangeText={setDesc}
            color="#FFFFFF"
          />
          <TextInput
            style={s.input}
            placeholder="Monto (ej: 200.00)"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            color="#FFFFFF"
          />
          <TouchableOpacity style={s.addBtn} onPress={handleAdd} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#000" />
              : <Text style={s.addBtnText}>+ Registrar préstamo</Text>}
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {loading
          ? <ActivityIndicator color={colors.primary} style={{marginTop: 20}} />
          : loans.length === 0
            ? <Text style={s.empty}>Sin préstamos registrados</Text>
            : loans.map(item => (
              <View key={item.id} style={[s.item, item.paid && s.itemPaid]}>
                <View style={{flex: 1}}>
                  <Text style={s.itemDesc}>{item.description}</Text>
                  <Text style={s.itemDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={[s.itemAmount, item.paid && {color: colors.success}]}>
                  {item.paid ? '✓ ' : ''}-${item.amount.toFixed(2)}
                </Text>
                {!item.paid && (
                  <TouchableOpacity onPress={() => handleMarkPaid(item.id)} style={s.paidBtn}>
                    <Text style={s.paidText}>✓</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={s.delBtn}>
                  <Text style={s.delText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
        }
        <View style={{height: 80}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 12},
  summaryRow: {flexDirection: 'row', gap: 12, marginBottom: 16},
  summaryCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1,
  },
  summaryLabel: {color: colors.gray2, fontSize: 12},
  summaryAmt: {fontSize: 22, fontWeight: '700', marginTop: 4},
  form: {backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 16, gap: 10},
  formTitle: {color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 4},
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFFFFF',
  },
  addBtn: {
    backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  addBtnText: {color: '#000', fontWeight: '700', fontSize: 15},
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  itemPaid: {opacity: 0.6},
  itemDesc: {color: '#FFFFFF', fontWeight: '600', fontSize: 14},
  itemDate: {color: colors.gray2, fontSize: 12, marginTop: 2},
  itemAmount: {color: colors.danger, fontWeight: '700', fontSize: 15, marginRight: 4},
  paidBtn: {padding: 6, marginRight: 2},
  paidText: {color: colors.success, fontSize: 16, fontWeight: '700'},
  delBtn: {padding: 6},
  delText: {color: colors.gray2, fontSize: 14},
  empty: {textAlign: 'center', color: colors.gray2, marginTop: 40},
});
