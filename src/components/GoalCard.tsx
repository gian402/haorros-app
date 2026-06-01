import React, {useRef, useEffect} from 'react';
import {TouchableOpacity, View, Text, Image, StyleSheet, Animated} from 'react-native';
import {Goal} from '../supabase/types';
import {ProgressBar} from './ProgressBar';
import {colors} from '../theme/colors';

interface Props {
  goal: Goal;
  onPress: () => void;
  index?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  viaje: '✈️', emergencia: '🚨', tecnologia: '💻',
  hogar: '🏠', educacion: '📚', salud: '💊', auto: '🚗', otro: '🎯',
};

function daysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export function GoalCard({goal, onPress, index = 0}: Props) {
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const memberCount = goal.members?.length ?? 0;
  const days = goal.deadline ? daysLeft(goal.deadline) : null;
  const catIcon = goal.category ? (CATEGORY_ICONS[goal.category] ?? '🎯') : '🎯';
  const isComplete = progress >= 100;

  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true}),
    ]).start();
  }, []);

  return (
    <Animated.View style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
      <TouchableOpacity
        style={[s.card, isComplete && s.cardComplete]}
        onPress={onPress}
        activeOpacity={0.88}>

        {/* Imagen o placeholder */}
        {goal.image_url ? (
          <Image source={{uri: goal.image_url}} style={s.image} resizeMode="cover" />
        ) : (
          <View style={s.imagePlaceholder}>
            <View style={s.emojiWrap}>
              <Text style={s.emoji}>{catIcon}</Text>
            </View>
            {isComplete && <View style={s.completeBanner}><Text style={s.completeBannerText}>✦ META COMPLETADA ✦</Text></View>}
          </View>
        )}

        {/* Borde dorado superior */}
        <View style={[s.topAccent, isComplete && s.topAccentComplete]} />

        <View style={s.body}>
          <View style={s.titleRow}>
            <Text style={s.title} numberOfLines={1}>{goal.title}</Text>
            {memberCount > 1 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>👥 {memberCount}</Text>
              </View>
            )}
          </View>

          <View style={s.metaRow}>
            <Text style={s.metaText}>Meta: <Text style={s.metaAmount}>S/ {goal.target_amount.toLocaleString()}</Text></Text>
            {days !== null && (
              <View style={[s.deadlineBadge, days <= 7 && s.deadlineBadgeUrgent]}>
                <Text style={[s.deadlineText, days <= 7 && s.deadlineTextUrgent]}>
                  {days > 0 ? `⏳ ${days}d` : '⚠️ Vencido'}
                </Text>
              </View>
            )}
          </View>

          <ProgressBar progress={progress} current={goal.current_amount} target={goal.target_amount} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 20, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  cardComplete: {
    borderColor: colors.primary + '60',
    shadowColor: colors.primary, shadowOpacity: 0.2,
  },
  topAccent: {height: 2, backgroundColor: colors.border},
  topAccentComplete: {backgroundColor: colors.primary},
  image: {width: '100%', height: 150},
  imagePlaceholder: {
    width: '100%', height: 130,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  emojiWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.primary + '18',
    borderWidth: 1, borderColor: colors.primary + '35',
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: {fontSize: 32},
  completeBanner: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.primary + 'CC', paddingVertical: 4, alignItems: 'center',
  },
  completeBannerText: {color: '#000', fontSize: 11, fontWeight: '800', letterSpacing: 2},
  body: {padding: 14},
  titleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8},
  title: {color: colors.white, fontWeight: '700', fontSize: 17, flex: 1},
  badge: {
    backgroundColor: colors.primary + '20', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.primary + '40',
  },
  badgeText: {color: colors.primary, fontSize: 11, fontWeight: '700'},
  metaRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  metaText: {color: colors.gray2, fontSize: 12},
  metaAmount: {color: colors.gray1, fontWeight: '600'},
  deadlineBadge: {
    backgroundColor: colors.primary + '18', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.primary + '35',
  },
  deadlineBadgeUrgent: {backgroundColor: colors.danger + '18', borderColor: colors.danger + '55'},
  deadlineText: {color: colors.primary, fontSize: 11, fontWeight: '700'},
  deadlineTextUrgent: {color: colors.danger},
});
