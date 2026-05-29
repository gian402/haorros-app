import React from 'react';
import {TouchableOpacity, View, Text, Image, StyleSheet} from 'react-native';
import {Goal} from '../supabase/types';
import {ProgressBar} from './ProgressBar';
import {colors} from '../theme/colors';

interface Props {
  goal: Goal;
  onPress: () => void;
}

export function GoalCard({goal, onPress}: Props) {
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      {goal.image_url ? (
        <Image source={{uri: goal.image_url}} style={s.image} resizeMode="cover" />
      ) : (
        <View style={s.imagePlaceholder}>
          <Text style={s.emoji}>🎯</Text>
        </View>
      )}
      <View style={s.body}>
        <Text style={s.title}>{goal.title}</Text>
        <Text style={s.sub}>Meta: S/ {goal.target_amount.toLocaleString()}</Text>
        <ProgressBar progress={progress} current={goal.current_amount} target={goal.target_amount} />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {width: '100%', height: 150},
  imagePlaceholder: {
    width: '100%', height: 150,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: {fontSize: 48},
  body: {padding: 16},
  title: {color: colors.white, fontWeight: '700', fontSize: 18, marginBottom: 4},
  sub: {color: colors.gray2, fontSize: 13, marginBottom: 12},
});
