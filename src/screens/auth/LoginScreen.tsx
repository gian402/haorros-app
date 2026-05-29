import React, {useState} from 'react';
import {View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../supabase/types';
import {authService} from '../../services/authService';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {colors} from '../../theme/colors';

type Props = {navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>};

export function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {setError('Completa todos los campos'); return;}
    setLoading(true); setError('');
    try {
      await authService.signIn(email.trim(), password);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    } finally {setLoading(false);}
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.container}>
          {/* Logo */}
          <View style={s.logoWrap}>
            <Text style={s.logoIcon}>💰</Text>
          </View>
          <Text style={s.title}>Haorros</Text>
          <Text style={s.subtitle}>Ahorra juntos, crece juntos</Text>

          {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

          <View style={s.form}>
            <Input label="Correo electrónico" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" />
            <Input label="Contraseña" value={password} onChangeText={setPassword}
              secureTextEntry placeholder="••••••••" />
            <Button title="Iniciar sesión" onPress={handleLogin} loading={loading} />
          </View>

          <TouchableOpacity style={s.link} onPress={() => navigation.navigate('Register')}>
            <Text style={s.linkText}>¿No tienes cuenta? <Text style={s.linkBold}>Regístrate</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  scroll: {flexGrow: 1},
  container: {flex: 1, paddingHorizontal: 28, justifyContent: 'center', paddingVertical: 40},
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, alignSelf: 'center',
    borderWidth: 1, borderColor: colors.primary + '44',
  },
  logoIcon: {fontSize: 36},
  title: {color: colors.white, fontSize: 32, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5},
  subtitle: {color: colors.gray2, fontSize: 15, textAlign: 'center', marginTop: 6, marginBottom: 36},
  errorBox: {
    backgroundColor: colors.danger + '22', borderWidth: 1, borderColor: colors.danger,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: {color: colors.danger, fontSize: 13},
  form: {gap: 4},
  link: {marginTop: 28, alignItems: 'center'},
  linkText: {color: colors.gray2, fontSize: 14},
  linkBold: {color: colors.primary, fontWeight: '700'},
});
