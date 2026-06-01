import React, {useState} from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuthStore} from '../../store/authStore';
import {useGoalsStore} from '../../store/goalsStore';
import {goalsService} from '../../services/goalsService';
import {extractError} from '../../services/extractError';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {colors} from '../../theme/colors';
import {MainStackParamList} from '../../supabase/types';

type Props = {navigation: NativeStackNavigationProp<MainStackParamList, 'CreateGoal'>};

const CATEGORIES = [
  {key: 'viaje', label: 'Viaje', icon: '✈️'},
  {key: 'emergencia', label: 'Emergencia', icon: '🚨'},
  {key: 'tecnologia', label: 'Tecnología', icon: '💻'},
  {key: 'hogar', label: 'Hogar', icon: '🏠'},
  {key: 'educacion', label: 'Educación', icon: '📚'},
  {key: 'salud', label: 'Salud', icon: '💊'},
  {key: 'auto', label: 'Auto', icon: '🚗'},
  {key: 'otro', label: 'Otro', icon: '🎯'},
];

export function CreateGoalScreen({navigation}: Props) {
  const {session} = useAuthStore();
  const {setGoals, goals} = useGoalsStore();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    if (result.assets?.[0]?.uri) setImageUri(result.assets[0].uri);
  };

  const handleCreate = async () => {
    if (!title.trim()) {Alert.alert('Error', 'Ingresa un título'); return;}
    const amount = parseFloat(target);
    if (!amount || amount <= 0) {Alert.alert('Error', 'Ingresa un monto válido'); return;}
    if (!session?.user.id) return;
    setLoading(true);
    try {
      // Payload base — siempre funciona aunque no existan columnas extra
      const payload: Parameters<typeof goalsService.createGoal>[0] = {
        title: title.trim(),
        target_amount: amount,
        image_url: null,
        owner_id: session.user.id,
      };
      // Agregar campos opcionales solo si tienen valor
      if (category) payload.category = category;
      if (deadline.length === 10) payload.deadline = deadline;

      const goal = await goalsService.createGoal(payload);

      if (imageUri) {
        try {
          goal.image_url = await goalsService.uploadImage(goal.id, imageUri);
        } catch {
          // imagen falla silenciosamente — la meta ya fue creada
        }
      }

      setGoals([goal, ...goals]);
      setTitle(''); setTarget(''); setCategory(''); setDeadline(''); setImageUri(null);
      Alert.alert('¡Listo!', 'Meta creada exitosamente 🎉', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (e: unknown) {
      Alert.alert('Error al crear meta', extractError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.imagePicker} onPress={pickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{uri: imageUri}} style={s.imagePreview} resizeMode="cover" />
          ) : (
            <View style={s.imagePlaceholder}>
              <Text style={s.cameraIcon}>📷</Text>
              <Text style={s.cameraText}>Agregar imagen (opcional)</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input label="Nombre de la meta" value={title} onChangeText={setTitle} placeholder="Ej: Viaje a Europa" />

        <View style={s.amountWrap}>
          <Text style={s.amountLabel}>Monto objetivo (S/)</Text>
          <TextInput
            style={s.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.gray3}
            keyboardType="decimal-pad"
            value={target}
            onChangeText={setTarget}
          />
        </View>

        <Text style={s.sectionLabel}>Categoría (opcional)</Text>
        <View style={s.categories}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[s.catBtn, category === c.key && s.catBtnActive]}
              onPress={() => setCategory(category === c.key ? '' : c.key)}
              activeOpacity={0.8}>
              <Text style={s.catIcon}>{c.icon}</Text>
              <Text style={[s.catLabel, category === c.key && s.catLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.amountWrap}>
          <Text style={s.amountLabel}>Fecha límite (opcional)</Text>
          <TextInput
            style={s.deadlineInput}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.gray3}
            value={deadline}
            onChangeText={setDeadline}
            maxLength={10}
          />
        </View>

        <Button title="Crear meta" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  content: {padding: 20, paddingBottom: 40},
  imagePicker: {borderRadius: 20, overflow: 'hidden', marginBottom: 20, height: 160, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border},
  imagePreview: {width: '100%', height: '100%'},
  imagePlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  cameraIcon: {fontSize: 36, marginBottom: 6},
  cameraText: {color: colors.gray2, fontSize: 13},
  amountWrap: {marginBottom: 20},
  amountLabel: {color: colors.gray2, fontSize: 13, fontWeight: '600', marginBottom: 6},
  amountInput: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    color: colors.white, fontSize: 22, fontWeight: '700',
  },
  deadlineInput: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    color: colors.white, fontSize: 16,
  },
  sectionLabel: {color: colors.gray2, fontSize: 13, fontWeight: '600', marginBottom: 10},
  categories: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20},
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
  },
  catBtnActive: {borderColor: colors.primary, backgroundColor: colors.primary + '22'},
  catIcon: {fontSize: 16},
  catLabel: {color: colors.gray2, fontSize: 13, fontWeight: '600'},
  catLabelActive: {color: colors.primary},
});
