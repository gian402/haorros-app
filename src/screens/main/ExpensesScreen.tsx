import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import {colors} from '../../theme/colors';
import {expensesService} from '../../services/expensesService';
import {useAuthStore} from '../../store/authStore';
import {Expense} from '../../supabase/types';

const CATEGORIES = ['Comida', 'Transporte', 'Ropa', 'Salud', 'Ocio', 'Otro'];

export function ExpensesScreen() {
  const user = useAuthStore(s => s.user);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Otro');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setExpenses(await expensesService.getExpenses(user.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = async () => {
    const num = parseFloat(amount);
    if (!desc.trim() || isNaN(num) || num <= 0) {
      Alert.alert('Error', 'Ingresa una descripción y monto válido.');
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      const newExp = await expensesService.addExpense({
        user_id: user.id,
        description: desc.trim(),
        amount: num,
        category,
      });
      setExpenses(prev => [newExp, ...prev]);
      setDesc('');
      setAmount('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este gasto?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await expensesService.deleteExpense(id);
          setExpenses(prev => prev.filter(e => e.id !== id));
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Total */}
      <View style={s.totalCard}>
        <Text style={s.totalLabel}>Total gastado</Text>
        <Text style={s.totalAmount}>-${total.toFixed(2)}</Text>
      </View>

      {/* Formulario */}
      <View style={s.form}>
        <TextInput
          style={s.input}
          placeholder="Descripción"
          placeholderTextColor={colors.gray2}
          value={desc}
          onChangeText={setDesc}
        />
        <TextInput
          style={[s.input, {flex: 1}]}
          placeholder="Monto"
          placeholderTextColor={colors.gray2}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
        {/* Categorías */}
        <View style={s.cats}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.catChip, category === cat && s.catActive]}
              onPress={() => setCategory(cat)}>
              <Text style={[s.catText, category === cat && s.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.addBtn} onPress={handleAdd} disabled={saving}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={s.addBtnText}>+ Agregar gasto</Text>}
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={i => i.id}
          contentContainerStyle={{paddingBottom: 40}}
          ListEmptyComponent={<Text style={s.empty}>Sin gastos registrados</Text>}
          renderItem={({item}) => (
            <View style={s.item}>
              <View style={{flex: 1}}>
                <Text style={s.itemDesc}>{item.description}</Text>
                <Text style={s.itemCat}>{item.category ?? 'Otro'} · {new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={s.itemAmount}>-${item.amount.toFixed(2)}</Text>
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
  totalCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 20,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: colors.danger + '60',
  },
  totalLabel: {color: colors.gray2, fontSize: 13},
  totalAmount: {color: colors.danger, fontSize: 32, fontWeight: '700', marginTop: 4},
  form: {backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 16, gap: 10},
  input: {
    backgroundColor: colors.surface, borderRadius: 10, padding: 12,
    color: colors.white, fontSize: 15, borderWidth: 1, borderColor: colors.border,
  },
  cats: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  catChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  catActive: {backgroundColor: colors.danger, borderColor: colors.danger},
  catText: {color: colors.gray2, fontSize: 12},
  catTextActive: {color: colors.white, fontWeight: '700'},
  addBtn: {
    backgroundColor: colors.danger, borderRadius: 10, paddingVertical: 13,
    alignItems: 'center',
  },
  addBtnText: {color: colors.white, fontWeight: '700', fontSize: 15},
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  itemDesc: {color: colors.white, fontWeight: '600', fontSize: 14},
  itemCat: {color: colors.gray2, fontSize: 12, marginTop: 2},
  itemAmount: {color: colors.danger, fontWeight: '700', fontSize: 15, marginRight: 8},
  delBtn: {padding: 6},
  delText: {color: colors.gray2, fontSize: 14},
  empty: {textAlign: 'center', color: colors.gray2, marginTop: 40},
});
