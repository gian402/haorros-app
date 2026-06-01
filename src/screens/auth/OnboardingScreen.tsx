import React, {useRef, useState} from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, Animated,
} from 'react-native';
import {colors} from '../../theme/colors';

const {width} = Dimensions.get('window');

const SLIDES = [
  {id: '1', emoji: '🎯', title: 'Define tus metas', subtitle: 'Crea metas de ahorro personales o compartidas con quien quieras.', accent: '#D4AF37'},
  {id: '2', emoji: '👥', title: 'Ahorra en equipo', subtitle: 'Invita amigos o familia y alcancen sus metas juntos en tiempo real.', accent: '#F0D060'},
  {id: '3', emoji: '📈', title: 'Sigue tu progreso', subtitle: 'Visualiza cuánto llevas ahorrado y cuánto falta para lograrlo.', accent: '#D4AF37'},
];

interface Props {
  onFinish: () => void;
}

export function OnboardingScreen({onFinish}: Props) {
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const next = () => {
    // Animación de pulso al tocar
    Animated.sequence([
      Animated.timing(scaleAnim, {toValue: 0.95, duration: 80, useNativeDriver: true}),
      Animated.timing(scaleAnim, {toValue: 1, duration: 80, useNativeDriver: true}),
    ]).start();

    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({index: index + 1, animated: true});
      setIndex(index + 1);
    } else {
      onFinish();
    }
  };

  return (
    <View style={s.container}>
      {/* Decoración fondo */}
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={e => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({item}) => (
          <View style={s.slide}>
            <View style={[s.emojiWrap, {borderColor: item.accent + '66', shadowColor: item.accent}]}>
              <View style={[s.emojiInner, {backgroundColor: item.accent + '18'}]}>
                <Text style={s.emoji}>{item.emoji}</Text>
              </View>
            </View>
            <Text style={s.title}>{item.title}</Text>
            <View style={[s.titleUnderline, {backgroundColor: item.accent}]} />
            <Text style={s.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              i === index && s.dotActive,
              i < index && s.dotPast,
            ]}
          />
        ))}
      </View>

      <Animated.View style={[s.btnWrap, {transform: [{scale: scaleAnim}]}]}>
        <TouchableOpacity style={s.btn} onPress={next} activeOpacity={0.9}>
          <Text style={s.btnText}>
            {index < SLIDES.length - 1 ? 'Siguiente  →' : 'Comenzar  ✦'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {index < SLIDES.length - 1 && (
        <TouchableOpacity style={s.skip} onPress={onFinish}>
          <Text style={s.skipText}>Omitir</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 52},
  bgCircle1: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: colors.primary + '08',
    borderWidth: 1, borderColor: colors.primary + '15',
  },
  bgCircle2: {
    position: 'absolute', bottom: 100, left: -100,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: colors.primary + '06',
    borderWidth: 1, borderColor: colors.primary + '10',
  },
  slide: {
    width, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingBottom: 60,
  },
  emojiWrap: {
    width: 130, height: 130, borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 36,
    shadowOpacity: 0.3, shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 10,
  },
  emojiInner: {
    width: 110, height: 110, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: {fontSize: 56},
  title: {
    color: colors.white, fontSize: 28, fontWeight: '800',
    textAlign: 'center', letterSpacing: -0.5, marginBottom: 10,
  },
  titleUnderline: {width: 40, height: 3, borderRadius: 2, marginBottom: 16},
  subtitle: {color: colors.gray2, fontSize: 15, textAlign: 'center', lineHeight: 24},
  dots: {flexDirection: 'row', gap: 8, marginBottom: 32},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray3},
  dotActive: {width: 28, backgroundColor: colors.primary, borderRadius: 4},
  dotPast: {backgroundColor: colors.primary + '55'},
  btnWrap: {width: width - 48},
  btn: {
    backgroundColor: colors.primary, borderRadius: 18,
    paddingVertical: 17, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  btnText: {color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 0.5},
  skip: {marginTop: 16},
  skipText: {color: colors.gray3, fontSize: 13},
});
