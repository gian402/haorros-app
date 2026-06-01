import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, StyleSheet, Dimensions} from 'react-native';
import {colors} from '../../theme/colors';

const {width} = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export function SplashScreen({onFinish}: Props) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {toValue: 1, tension: 60, friction: 7, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 1, duration: 400, useNativeDriver: true}),
      ]),
      Animated.timing(textOpacity, {toValue: 1, duration: 300, delay: 100, useNativeDriver: true}),
      Animated.delay(800),
      Animated.timing(fadeOut, {toValue: 0, duration: 350, useNativeDriver: true}),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[s.container, {opacity: fadeOut}]}>
      <Animated.View style={[s.logoWrap, {transform: [{scale}], opacity}]}>
        <Text style={s.logoEmoji}>💰</Text>
      </Animated.View>
      <Animated.Text style={[s.title, {opacity: textOpacity}]}>Haorros</Animated.Text>
      <Animated.Text style={[s.tagline, {opacity: textOpacity}]}>Ahorra juntos, crece juntos</Animated.Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: {fontSize: 48},
  title: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: colors.gray2,
    fontSize: 15,
    marginTop: 8,
  },
});
