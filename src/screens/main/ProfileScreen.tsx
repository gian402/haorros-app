import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useAuthStore} from '../../store/authStore';

export function ProfileScreen() {
  const {session, signOut} = useAuthStore();

  return (
    <View className="flex-1 bg-dark-bg px-6 pt-8">
      <View className="bg-dark-card rounded-2xl p-6 mb-6 items-center">
        <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-3">
          <Text className="text-3xl">👤</Text>
        </View>
        <Text className="text-white text-xl font-bold">{session?.user.user_metadata?.name ?? 'Usuario'}</Text>
        <Text className="text-gray-400 text-sm mt-1">{session?.user.email}</Text>
      </View>

      <TouchableOpacity
        className="bg-dark-card rounded-2xl p-4 flex-row items-center"
        onPress={signOut}
        activeOpacity={0.8}>
        <Text className="text-red-400 text-base font-medium">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
