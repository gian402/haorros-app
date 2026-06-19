import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import {colors} from '../../theme/colors';
import {expensesService} from '../../services/expensesService';
import {useAuthStore} from '../../store/authStore';
import {Expense} from '../../supabase/types';

const CATEGORIES = ['Comida', 'Transporte', 'Ropa', 'Salud', 'Ocio', 'Otro'];

export function ExpensesScreen() {
  const session = useAuthStore(s => s.session);
  const userId = session?.user?.id;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Otro');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setExpenses(await expensesService.getExpenses(userId));
    } catch (e: any) {
      Alert.alert('Error al cargar', e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = async () => {
    const num = parseFloat(amount.replace(',', '.'));
    if (!desc.trim() || isNaN(num) || num <= 0) {
      Alert.alert('Datos inválidos', 'Ingresa una descripción y un monto mayor a 0.');
      return;
    }
    if (!userId) { Alert.alert('Error', 'No hay sesión activa.'); return; }
    setSaving(true);
    try {
      const newExp = await expensesService.addExpense({
        user_id: userId,
        description: desc.trim(),
        amount: num,
        category,
      });
      setExpenses(prev => [newExp, ...prev]);
      setDesc('');
      setAmount('');
    } catch (e: any) {
      Alert.alert('Error al guardar', e.message ?? JSON.stringify(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este gasto?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await expensesService.deleteExpense(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Total */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Total gastado</Text>
          <Text style={s.totalAmount}>-${total.toFixed(2)}</Text>
        </View>

        {/* Formulario */}
        <View style={s.form}>
          <Text style={s.formTitle}>Nuevo gasto</Text>
          <TextInput
            style={s.input}
            placeholder="Descripción del gasto"
            placeholderTextColor="#666"
            value={desc}
            onChangeText={setDesc}
            color="#FFFFFF"
          />
          <TextInput
            style={s.input}
            placeholder="Monto (ej: 150.00)"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            color="#FFFFFF"
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
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.addBtnText}>+ Agregar gasto</Text>}
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {loading
          ? <ActivityIndicator color={colors.primary} style={{marginTop: 20}} />
          : expenses.length === 0
            ? <Text style={s.empty}>Sin gastos registrados</Text>
            : expenses.map(item => (
              <View key={item.id} style={s.item}>
                <View style={{flex: 1}}>
                  <Text style={s.itemDesc}>{item.description}</Text>
                  <Text style={s.itemCat}>{item.category ?? 'Otro'} · {new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={s.itemAmount}>-${item.amount.toFixed(2)}</Text>
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
  totalCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 20,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: colors.danger + '60',
  },
  totalLabel: {color: colors.gray2, fontSize: 13},
  totalAmount: {color: colors.danger, fontSize: 32, fontWeight: '700', marginTop: 4},
  form: {backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 16, gap: 10},
  formTitle: {color: colors.white, fontSize: 14, fontWeight: '700', marginBottom: 4},
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFFFFF',
  },
  cats: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  catChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  catActive: {backgroundColor: colors.danger, borderColor: colors.danger},
  catText: {color: colors.gray2, fontSize: 12},
  catTextActive: {color: '#fff', fontWeight: '700'},
  addBtn: {
    backgroundColor: colors.danger, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  addBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  itemDesc: {color: '#FFFFFF', fontWeight: '600', fontSize: 14},
  itemCat: {color: colors.gray2, fontSize: 12, marginTop: 2},
  itemAmount: {color: colors.danger, fontWeight: '700', fontSize: 15, marginRight: 8},
  delBtn: {padding: 6},
  delText: {color: colors.gray2, fontSize: 14},
  empty: {textAlign: 'center', color: colors.gray2, marginTop: 40},
});
