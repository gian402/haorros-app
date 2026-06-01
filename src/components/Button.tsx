import React, {useRef} from 'react';
import {TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated} from 'react-native';
import {colors} from '../theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
}

export function Button({title, onPress, loading, variant = 'primary', disabled}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {toValue: 0.96, duration: 70, useNativeDriver: true}),
      Animated.timing(scale, {toValue: 1, duration: 70, useNativeDriver: true}),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[{transform: [{scale}]}, (disabled || loading) && s.disabled]}>
      <TouchableOpacity
        style={[s.base, s[variant]]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.9}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#000' : colors.primary} />
        ) : (
          <Text style={[s.text, variant !== 'primary' && s.textAlt]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  base: {
    borderRadius: 16, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  outline: {
    borderWidth: 1.5, borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  ghost: {backgroundColor: 'transparent'},
  disabled: {opacity: 0.4},
  text: {color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 0.3},
  textAlt: {color: colors.primary, fontWeight: '700'},
});
