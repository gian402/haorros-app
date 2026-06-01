import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';

interface Props {
  progress: number;
  current: number;
  target: number;
}

function getBarColor(progress: number): string {
  if (progress >= 80) return '#00C853'; // verde
  if (progress >= 30) return '#FFB300'; // amarillo
  return '#FF4D6D';                     // rojo
}

export function ProgressBar({progress, current, target}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(progress, 100),
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress, anim]);

  const width = anim.interpolate({inputRange: [0, 100], outputRange: ['0%', '100%']});
  const barColor = getBarColor(progress);

  return (
    <View>
      <View style={s.row}>
        <Text style={s.amount}>S/ {current.toLocaleString()}</Text>
        <View style={[s.badge, {backgroundColor: barColor + '33'}]}>
          <Text style={[s.pct, {color: barColor}]}>{Math.round(progress)}%</Text>
        </View>
        <Text style={s.target}>S/ {target.toLocaleString()}</Text>
      </View>
      <View style={s.track}>
        <Animated.View style={[s.fill, {width, backgroundColor: barColor}]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  amount: {color: colors.gray2, fontSize: 13},
  target: {color: colors.gray2, fontSize: 13},
  badge: {paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20},
  pct: {fontWeight: '700', fontSize: 13},
  track: {height: 8, backgroundColor: colors.border, borderRadius: 99, overflow: 'hidden'},
  fill: {height: '100%', borderRadius: 99},
});
