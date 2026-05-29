import React, {useState} from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuthStore} from '../../store/authStore';
import {useGoalsStore} from '../../store/goalsStore';
import {goalsService} from '../../services/goalsService';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';

export function CreateGoalScreen() {
  const {session} = useAuthStore();
  const {setGoals, goals} = useGoalsStore();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    if (result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {Alert.alert('Error', 'Ingresa un título'); return;}
    const amount = parseFloat(target);
    if (!amount || amount <= 0) {Alert.alert('Error', 'Ingresa un monto válido'); return;}
    if (!session?.user.id) return;

    setLoading(true);
    try {
      const goal = await goalsService.createGoal({
        title: title.trim(),
        target_amount: amount,
        image_url: null,
        owner_id: session.user.id,
      });

      if (imageUri) {
        const url = await goalsService.uploadImage(goal.id, imageUri);
        goal.image_url = url;
      }

      setGoals([goal, ...goals]);
      setTitle('');
      setTarget('');
      setImageUri(null);
      Alert.alert('¡Listo!', 'Meta creada exitosamente');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al crear meta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dark-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{padding: 16}} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          className="w-full h-44 bg-dark-card rounded-2xl mb-6 items-center justify-center overflow-hidden"
          onPress={pickImage}
          activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{uri: imageUri}} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center">
              <Text className="text-4xl mb-2">📷</Text>
              <Text className="text-gray-400">Toca para agregar imagen</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input label="Nombre de la meta" value={title} onChangeText={setTitle} placeholder="Ej: Viaje a Europa" />

        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-1 font-medium">Monto objetivo (S/)</Text>
          <TextInput
            className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white text-base"
            placeholder="0.00"
            placeholderTextColor="#555577"
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
