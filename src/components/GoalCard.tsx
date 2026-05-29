import React from 'react';
import {TouchableOpacity, View, Text, Image} from 'react-native';
import {Goal} from '../supabase/types';
import {ProgressBar} from './ProgressBar';

interface Props {
  goal: Goal;
  onPress: () => void;
}

export function GoalCard({goal, onPress}: Props) {
  const progress = goal.target_amount > 0
    ? (goal.current_amount / goal.target_amount) * 100
    : 0;

  return (
    <TouchableOpacity
      className="bg-dark-card rounded-2xl mb-4 overflow-hidden"
      onPress={onPress}
      activeOpacity={0.85}>
      {goal.image_url ? (
        <Image source={{uri: goal.image_url}} className="w-full h-36" resizeMode="cover" />
      ) : (
        <View className="w-full h-36 bg-dark-surface items-center justify-center">
          <Text className="text-4xl">🎯</Text>
        </View>
      )}
      <View className="p-4">
        <Text className="text-white font-bold text-lg mb-1">{goal.title}</Text>
        <Text className="text-gray-400 text-sm mb-3">
          Meta: S/ {goal.target_amount.toLocaleString()}
        </Text>
        <ProgressBar
          progress={progress}
          current={goal.current_amount}
          target={goal.target_amount}
        />
      </View>
    </TouchableOpacity>
  );
}
