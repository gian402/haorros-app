import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
}

export function Button({title, onPress, loading, variant = 'primary', disabled}: Props) {
  return (
    <TouchableOpacity
      style={[s.base, s[variant], (disabled || loading) && s.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text style={[s.text, variant !== 'primary' && s.textAlt]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {backgroundColor: colors.primary},
  outline: {borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent'},
  ghost: {backgroundColor: 'transparent'},
  disabled: {opacity: 0.45},
  text: {color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.3},
  textAlt: {color: colors.primary},
});
