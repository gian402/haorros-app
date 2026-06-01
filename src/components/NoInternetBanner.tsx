import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';

export function NoInternetBanner() {
  return (
    <View style={s.banner}>
      <Text style={s.text}>📡 Sin conexión a internet</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    backgroundColor: colors.danger,
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {color: '#fff', fontWeight: '700', fontSize: 13},
});
