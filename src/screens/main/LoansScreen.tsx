import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import {colors} from '../../theme/colors';
import {loansService} from '../../services/loansService';
import {useAuthStore} from '../../store/authStore';
import {Loan} from '../../supabase/types';

export function LoansScreen() {
  const user = useAuthStore(s => s.user);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setLoans(await loansService.getLoans(user.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const pending = loans.filter(l => !l.paid).reduce((sum, l) => sum + l.amount, 0);
  const paid = loans.filter(l => l.paid).reduce((sum, l) => sum + l.amount, 0);

  const handleAdd = async () => {
    const num = parseFloat(amount);
    if (!desc.trim() || isNaN(num) || num <= 0) {
      Alert.alert('Error', 'Ingresa una descripción y monto válido.');
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      const newLoan = await loansService.addLoan({
        user_id: user.id,
        description: desc.trim(),
        amount: num,
        paid: false,
      });
      setLoans(prev => [newLoan, ...prev]);
      setDesc('');
      setAmount('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = (id: string) => {
    Alert.alert('Marcar pagado', '¿Este préstamo ya fue pagado?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Sí, pagado', onPress: async () => {
          await loansService.markPaid(id);
          setLoans(prev => prev.map(l => l.id === id ? {...l, paid: true} : l));
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este préstamo?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await loansService.deleteLoan(id);
          setLoans(prev => prev.filter(l => l.id !== id));
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
        <TextInput
          style={s.input}
          placeholder="¿A quién / para qué?"
          placeholderTextColor={colors.gray2}
          value={desc}
          onChangeText={setDesc}
        />
        <TextInput
          style={s.input}
          placeholder="Monto"
          placeholderTextColor={colors.gray2}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity style={s.addBtn} onPress={handleAdd} disabled={saving}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={s.addBtnText}>+ Registrar préstamo</Text>}
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={i => i.id}
          contentContainerStyle={{paddingBottom: 40}}
          ListEmptyComponent={<Text style={s.empty}>Sin préstamos registrados</Text>}
          renderItem={({item}) => (
            <View style={[s.item, item.paid && s.itemPaid]}>
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
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.bg, padding: 16},
  summaryRow: {flexDirection: 'row', gap: 12, marginBottom: 16},
  summaryCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1,
  },
  summaryLabel: {color: colors.gray2, fontSize: 12},
  summaryAmt: {fontSize: 22, fontWeight: '700', marginTop: 4},
  form: {backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 16, gap: 10},
  input: {
    backgroundColor: colors.surface, borderRadius: 10, padding: 12,
    color: colors.white, fontSize: 15, borderWidth: 1, borderColor: colors.border,
  },
  addBtn: {
    backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 13,
    alignItems: 'center',
  },
  addBtnText: {color: '#000', fontWeight: '700', fontSize: 15},
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  itemPaid: {opacity: 0.6},
  itemDesc: {color: colors.white, fontWeight: '600', fontSize: 14},
  itemDate: {color: colors.gray2, fontSize: 12, marginTop: 2},
  itemAmount: {color: colors.danger, fontWeight: '700', fontSize: 15, marginRight: 4},
  paidBtn: {padding: 6, marginRight: 2},
  paidText: {color: colors.success, fontSize: 16, fontWeight: '700'},
  delBtn: {padding: 6},
  delText: {color: colors.gray2, fontSize: 14},
  empty: {textAlign: 'center', color: colors.gray2, marginTop: 40},
});
