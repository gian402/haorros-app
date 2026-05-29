import React, {useState} from 'react';
import {View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../supabase/types';
import {authService} from '../../services/authService';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';

type Props = {navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>};

export function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {setError('Completa todos los campos'); return;}
    setLoading(true);
    setError('');
    try {
      await authService.signIn(email.trim(), password);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
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
          <Text className="text-white text-4xl font-bold mb-2">Haorros</Text>
          <Text className="text-gray-400 text-base mb-10">Ahorra juntos, crece juntos</Text>

          {error ? (
            <View className="bg-red-900/30 border border-red-500 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-sm">{error}</Text>
            </View>
          ) : null}

          <Input label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" />
          <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

          <Button title="Iniciar sesión" onPress={handleLogin} loading={loading} />

          <TouchableOpacity className="mt-6 items-center" onPress={() => navigation.navigate('Register')}>
            <Text className="text-gray-400">
              ¿No tienes cuenta? <Text className="text-primary font-bold">Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
