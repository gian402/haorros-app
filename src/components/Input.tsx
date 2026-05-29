import React from 'react';
import {TextInput, Text, View, TextInputProps} from 'react-native';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({label, error, ...props}: Props) {
  return (
    <View className="mb-4">
      <Text className="text-gray-400 text-sm mb-1 font-medium">{label}</Text>
      <TextInput
        className={`bg-dark-surface border rounded-xl px-4 py-3 text-white text-base ${
          error ? 'border-red-500' : 'border-dark-border'
        }`}
        placeholderTextColor="#555577"
        {...props}
      />
      {error ? <Text className="text-red-400 text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
