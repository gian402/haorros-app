import React, {useState} from 'react';
import {View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../supabase/types';
import {authService} from '../../services/authService';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';

type Props = {navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>};

export function RegisterScreen({navigation}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {setError('Completa todos los campos'); return;}
    if (password.length < 6) {setError('La contraseña debe tener al menos 6 caracteres'); return;}
    setLoading(true);
    setError('');
    try {
      await authService.signUp(email.trim(), password, name.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dark-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-4xl font-bold mb-2">Crear cuenta</Text>
          <Text className="text-gray-400 text-base mb-10">Únete a Haorros</Text>

          {error ? (
            <View className="bg-red-900/30 border border-red-500 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-sm">{error}</Text>
            </View>
          ) : null}

          <Input label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />
          <Input label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" />
          <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres" />

          <Button title="Crear cuenta" onPress={handleRegister} loading={loading} />

          <TouchableOpacity className="mt-6 items-center" onPress={() => navigation.goBack()}>
            <Text className="text-gray-400">
              ¿Ya tienes cuenta? <Text className="text-primary font-bold">Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
