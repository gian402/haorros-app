import React, {useState} from 'react';
import {View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../supabase/types';
import {authService} from '../../services/authService';
import {translateAuthError} from '../../services/authErrors';
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
      setError(translateAuthError(e instanceof Error ? e.message : ''));
    } finally {setLoading(false);}
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.container}>
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

            <TouchableOpacity style={s.forgotWrap} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

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
    width: 88, height: 88, borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, alignSelf: 'center',
    shadowColor: colors.primary, shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.45, shadowRadius: 20, elevation: 10,
  },
  logoIcon: {fontSize: 40},
  title: {color: colors.white, fontSize: 32, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5},
  subtitle: {color: colors.gray2, fontSize: 15, textAlign: 'center', marginTop: 6, marginBottom: 36},
  errorBox: {
    backgroundColor: colors.danger + '18', borderWidth: 1, borderColor: colors.danger + '88',
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: {color: colors.danger, fontSize: 13},
  form: {gap: 4},
  forgotWrap: {alignSelf: 'flex-end', marginBottom: 8, marginTop: -4},
  forgotText: {color: colors.primary, fontSize: 13, fontWeight: '600'},
  link: {marginTop: 28, alignItems: 'center'},
  linkText: {color: colors.gray2, fontSize: 14},
  linkBold: {color: colors.primary, fontWeight: '700'},
});
