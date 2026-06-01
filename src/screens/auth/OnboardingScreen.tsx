import React, {useRef, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, Dimensions} from 'react-native';
import {colors} from '../../theme/colors';

const {width} = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🎯',
    title: 'Define tus metas',
    subtitle: 'Crea metas de ahorro personales o compartidas con quien quieras.',
  },
  {
    id: '2',
    emoji: '👥',
    title: 'Ahorra en equipo',
    subtitle: 'Invita amigos o familia y alcancen sus metas juntos en tiempo real.',
  },
  {
    id: '3',
    emoji: '📈',
    title: 'Sigue tu progreso',
    subtitle: 'Visualiza cuánto llevas ahorrado y cuánto falta para lograrlo.',
  },
];

interface Props {
  onFinish: () => void;
}

export function OnboardingScreen({onFinish}: Props) {
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const next = () => {
    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({index: index + 1});
      setIndex(index + 1);
    } else {
      onFinish();
    }
  };

  return (
    <View style={s.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={s.slide}>
            <View style={s.emojiWrap}>
              <Text style={s.emoji}>{item.emoji}</Text>
            </View>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === index && s.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={next} activeOpacity={0.85}>
        <Text style={s.btnText}>
          {index < SLIDES.length - 1 ? 'Siguiente' : 'Comenzar'}
        </Text>
      </TouchableOpacity>

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
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emojiWrap: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {fontSize: 56},
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  subtitle: {
    color: colors.gray2,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {flexDirection: 'row', gap: 8, marginBottom: 36},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray3},
  dotActive: {width: 24, backgroundColor: colors.primary},
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: width - 48,
    alignItems: 'center',
  },
  btnText: {color: '#fff', fontWeight: '700', fontSize: 16},
  skip: {marginTop: 16},
  skipText: {color: colors.gray2, fontSize: 14},
});
