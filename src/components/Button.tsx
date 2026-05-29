import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator} from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}

export function Button({title, onPress, loading, variant = 'primary', disabled}: Props) {
  const base = 'rounded-2xl py-4 items-center justify-center';
  const styles = variant === 'primary'
    ? `${base} bg-primary`
    : `${base} border border-primary`;

  return (
    <TouchableOpacity
      className={`${styles} ${disabled || loading ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`font-bold text-base ${variant === 'outline' ? 'text-primary' : 'text-white'}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
