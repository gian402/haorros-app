import React, {useState} from 'react';
import {View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../supabase/types';
import {supabase} from '../../supabase/client';
import {translateAuthError} from '../../services/authErrors';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {colors} from '../../theme/colors';

type Props = {navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>};

export function ForgotPasswordScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {setError('Ingresa tu correo'); return;}
    setLoading(true); setError('');
    const {error: err} = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (err) {setError(translateAuthError(err.message)); return;}
    setSent(true);
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.container}>
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Volver</Text>
          </TouchableOpacity>

          <View style={s.iconWrap}>
            <Text style={s.icon}>🔑</Text>
          </View>
          <Text style={s.title}>Recuperar contraseña</Text>
          <Text style={s.subtitle}>Te enviaremos un enlace para restablecer tu contraseña</Text>

          {sent ? (
            <View style={s.successBox}>
              <Text style={s.successText}>✅ Revisa tu correo. Si la cuenta existe, recibirás el enlace en breve.</Text>
            </View>
          ) : (
            <>
              {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
              <Input label="Correo electrónico" value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" />
              <View style={s.btnWrap}>
                <Button title="Enviar enlace" onPress={handleSend} loading={loading} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg},
  scroll: {flexGrow: 1},
  container: {flex: 1, paddingHorizontal: 28, justifyContent: 'center', paddingVertical: 40},
  back: {position: 'absolute', top: 52, left: 28},
  backText: {color: colors.primary, fontSize: 15, fontWeight: '600'},
  iconWrap: {
    width: 88, height: 88, borderRadius: 26,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, alignSelf: 'center',
  },
  icon: {fontSize: 40},
  title: {color: colors.white, fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5},
  subtitle: {color: colors.gray2, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 32, lineHeight: 22},
  errorBox: {
    backgroundColor: colors.danger + '18', borderWidth: 1, borderColor: colors.danger + '88',
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: {color: colors.danger, fontSize: 13},
  successBox: {
    backgroundColor: colors.accent + '18', borderWidth: 1, borderColor: colors.accent + '88',
    borderRadius: 12, padding: 16,
  },
  successText: {color: colors.accent, fontSize: 14, lineHeight: 22},
  btnWrap: {marginTop: 8},
});
