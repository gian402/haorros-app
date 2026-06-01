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
      {/* Decoración fondo */}
      <View style={s.circle1} />
      <View style={s.circle2} />
      <View style={s.circle3} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.container}>
          {/* Logo */}
          <View style={s.logoOuter}>
            <View style={s.logoWrap}>
              <Text style={s.logoIcon}>💰</Text>
            </View>
          </View>
          <Text style={s.title}>Haorros</Text>
          <Text style={s.subtitle}>Ahorra juntos, crece juntos</Text>

          {/* Línea decorativa */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>✦</Text>
            <View style={s.dividerLine} />
          </View>

          {error ? <View style={s.errorBox}><Text style={s.errorText}>⚠ {error}</Text></View> : null}

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
  circle1: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: colors.primary + '0A',
    borderWidth: 1, borderColor: colors.primary + '18',
  },
  circle2: {
    position: 'absolute', top: 80, right: -100,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: colors.primary + '06',
    borderWidth: 1, borderColor: colors.primary + '10',
  },
  circle3: {
    position: 'absolute', bottom: -80, left: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: colors.primary + '07',
    borderWidth: 1, borderColor: colors.primary + '12',
  },
  scroll: {flexGrow: 1},
  container: {flex: 1, paddingHorizontal: 28, justifyContent: 'center', paddingVertical: 40},
  logoOuter: {
    width: 100, height: 100, borderRadius: 30,
    borderWidth: 1, borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '10',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 20,
    shadowColor: colors.primary, shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  logoWrap: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoIcon: {fontSize: 38},
  title: {color: colors.white, fontSize: 34, fontWeight: '800', textAlign: 'center', letterSpacing: 1},
  subtitle: {color: colors.gray2, fontSize: 14, textAlign: 'center', marginTop: 6},
  dividerRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12},
  dividerLine: {flex: 1, height: 1, backgroundColor: colors.border},
  dividerText: {color: colors.primary, fontSize: 14},
  errorBox: {
    backgroundColor: colors.danger + '15', borderWidth: 1, borderColor: colors.danger + '60',
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
