import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, StyleSheet, Easing} from 'react-native';
import {colors} from '../../theme/colors';

interface Props {
  onFinish: () => void;
}

export function SplashScreen({onFinish}: Props) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0.6)).current;
  const ring2 = useRef(new Animated.Value(0.6)).current;
  const ring1Op = useRef(new Animated.Value(0.6)).current;
  const ring2Op = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Pulso anillos
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1, {toValue: 1.6, duration: 1400, useNativeDriver: true, easing: Easing.out(Easing.ease)}),
          Animated.timing(ring1Op, {toValue: 0, duration: 1400, useNativeDriver: true}),
        ]),
      ])
    ).start();
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ring2, {toValue: 1.6, duration: 1400, useNativeDriver: true, easing: Easing.out(Easing.ease)}),
            Animated.timing(ring2Op, {toValue: 0, duration: 1400, useNativeDriver: true}),
          ]),
        ])
      ).start();
    }, 700);

    // Secuencia principal
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {toValue: 1, tension: 55, friction: 6, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 1, duration: 500, useNativeDriver: true}),
      ]),
      Animated.timing(textOpacity, {toValue: 1, duration: 400, useNativeDriver: true}),
      Animated.delay(900),
      Animated.timing(fadeOut, {toValue: 0, duration: 400, useNativeDriver: true}),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[s.container, {opacity: fadeOut}]}>
      {/* Anillos de pulso */}
      <Animated.View style={[s.ring, {transform: [{scale: ring1}], opacity: ring1Op}]} />
      <Animated.View style={[s.ring, {transform: [{scale: ring2}], opacity: ring2Op}]} />

      {/* Logo */}
      <Animated.View style={[s.logoWrap, {transform: [{scale}], opacity}]}>
        <Text style={s.logoEmoji}>💰</Text>
      </Animated.View>

      <Animated.View style={{opacity: textOpacity, alignItems: 'center'}}>
        <Text style={s.title}>Haorros</Text>
        <View style={s.divider} />
        <Text style={s.tagline}>Ahorra juntos, crece juntos</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  logoWrap: {
    width: 110, height: 110, borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoEmoji: {fontSize: 52},
  title: {
    color: colors.white, fontSize: 38, fontWeight: '800',
    letterSpacing: 2,
  },
  divider: {
    width: 40, height: 2, backgroundColor: colors.primary,
    borderRadius: 2, marginVertical: 10,
  },
  tagline: {color: colors.gray2, fontSize: 14, letterSpacing: 1},
});
