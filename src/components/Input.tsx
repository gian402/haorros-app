import React, {useState} from 'react';
import {TextInput, Text, View, TextInputProps, StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '../theme/colors';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({label, error, secureTextEntry, ...props}: Props) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const isPassword = secureTextEntry;

  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.row, error ? s.rowError : null]}>
        <TextInput
          style={s.input}
          placeholderTextColor={colors.gray3}
          secureTextEntry={hidden}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} style={s.eye}>
            <Text style={s.eyeText}>{hidden ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {marginBottom: 16},
  label: {color: colors.gray2, fontSize: 13, fontWeight: '600', marginBottom: 6, letterSpacing: 0.4},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  rowError: {borderColor: colors.danger},
  input: {flex: 1, color: colors.white, fontSize: 15, paddingVertical: 13},
  eye: {padding: 4},
  eyeText: {fontSize: 16},
  error: {color: colors.danger, fontSize: 12, marginTop: 4},
});
