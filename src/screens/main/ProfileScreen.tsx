import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {colors} from '../../theme/colors';

export function ProfileScreen() {
  const {session, signOut} = useAuthStore();
  const name = session?.user.user_metadata?.name ?? 'Usuario';
  const email = session?.user.email ?? '';
  const initial = name[0].toUpperCase();

  return (
    <View style={s.flex}>
      <View style={s.card}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>
        <Text style={s.name}>{name}</Text>
        <Text style={s.email}>{email}</Text>
      </View>

      <View style={s.section}>
        <TouchableOpacity style={s.row} onPress={signOut} activeOpacity={0.8}>
          <Text style={s.rowIcon}>🚪</Text>
          <Text style={s.rowLabel}>Cerrar sesión</Text>
          <Text style={s.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.bg, padding: 20},
  card: {
    backgroundColor: colors.card, borderRadius: 24, padding: 24,
    alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: colors.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarText: {color: '#fff', fontSize: 32, fontWeight: '800'},
  name: {color: colors.white, fontSize: 22, fontWeight: '700'},
  email: {color: colors.gray2, fontSize: 14, marginTop: 4},
  section: {backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border},
  row: {flexDirection: 'row', alignItems: 'center', padding: 16},
  rowIcon: {fontSize: 20, marginRight: 12},
  rowLabel: {flex: 1, color: colors.danger, fontSize: 16, fontWeight: '600'},
  rowArrow: {color: colors.gray2, fontSize: 22},
});
