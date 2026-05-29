import React, {useState} from 'react';
import {View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuthStore} from '../../store/authStore';
import {useGoalsStore} from '../../store/goalsStore';
import {goalsService} from '../../services/goalsService';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {colors} from '../../theme/colors';

export function CreateGoalScreen() {
  const {session} = useAuthStore();
  const {setGoals, goals} = useGoalsStore();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
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
      const goal = await goalsService.createGoal({
        title: title.trim(), target_amount: amount,
        image_url: null, owner_id: session.user.id,
      });
      if (imageUri) {
        goal.image_url = await goalsService.uploadImage(goal.id, imageUri);
      }
      setGoals([goal, ...goals]);
      setTitle(''); setTarget(''); setImageUri(null);
      Alert.alert('¡Listo!', 'Meta creada exitosamente 🎉');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      Alert.alert('Error al crear meta', msg);
    } finally {setLoading(false);}
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
              <Text style={s.cameraText}>Agregar imagen</Text>
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

        <Button title="Crear meta" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  content: {padding: 20, paddingBottom: 40},
  imagePicker: {borderRadius: 20, overflow: 'hidden', marginBottom: 20, height: 180, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border},
  imagePreview: {width: '100%', height: '100%'},
  imagePlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  cameraIcon: {fontSize: 40, marginBottom: 8},
  cameraText: {color: colors.gray2, fontSize: 14},
  amountWrap: {marginBottom: 20},
  amountLabel: {color: colors.gray2, fontSize: 13, fontWeight: '600', marginBottom: 6},
  amountInput: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    color: colors.white, fontSize: 22, fontWeight: '700',
  },
});
