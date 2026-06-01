import React from 'react';
import {TouchableOpacity, View, Text, Image, StyleSheet} from 'react-native';
import {Goal} from '../supabase/types';
import {ProgressBar} from './ProgressBar';
import {colors} from '../theme/colors';

interface Props {
  goal: Goal;
  onPress: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  viaje: '✈️', emergencia: '🚨', tecnologia: '💻',
  hogar: '🏠', educacion: '📚', salud: '💊', auto: '🚗', otro: '🎯',
};

function daysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export function GoalCard({goal, onPress}: Props) {
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const memberCount = goal.members?.length ?? 0;
  const days = goal.deadline ? daysLeft(goal.deadline) : null;
  const catIcon = goal.category ? (CATEGORY_ICONS[goal.category] ?? '🎯') : null;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      {goal.image_url ? (
        <Image source={{uri: goal.image_url}} style={s.image} resizeMode="cover" />
      ) : (
        <View style={s.imagePlaceholder}>
          <Text style={s.emoji}>{catIcon ?? '🎯'}</Text>
        </View>
      )}
      <View style={s.body}>
        <View style={s.titleRow}>
          <Text style={s.title} numberOfLines={1}>{goal.title}</Text>
          {memberCount > 1 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>👥 {memberCount}</Text>
            </View>
          )}
        </View>
        <Text style={s.sub}>Meta: S/ {goal.target_amount.toLocaleString()}</Text>
        {days !== null && (
          <Text style={[s.deadline, days <= 7 && {color: colors.danger}]}>
            {days > 0 ? `⏳ ${days} días restantes` : '⚠️ Plazo vencido'}
          </Text>
        )}
        <ProgressBar progress={progress} current={goal.current_amount} target={goal.target_amount} />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 20, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },
  image: {width: '100%', height: 150},
  imagePlaceholder: {
    width: '100%', height: 150, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: {fontSize: 48},
  body: {padding: 16},
  titleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8},
  title: {color: colors.white, fontWeight: '700', fontSize: 18, flex: 1},
  badge: {
    backgroundColor: colors.primary + '22', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.primary + '44',
  },
  badgeText: {color: colors.primary, fontSize: 12, fontWeight: '700'},
  sub: {color: colors.gray2, fontSize: 13, marginBottom: 6},
  deadline: {color: colors.primary, fontSize: 12, fontWeight: '600', marginBottom: 8},
});
