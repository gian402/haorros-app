import React, {useState, useRef} from 'react';
import {TextInput, Text, View, TextInputProps, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {colors} from '../theme/colors';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({label, error, secureTextEntry, ...props}: Props) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {toValue: 1, duration: 180, useNativeDriver: false}).start();
    props.onFocus?.({} as any);
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {toValue: 0, duration: 180, useNativeDriver: false}).start();
    props.onBlur?.({} as any);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.danger : colors.border, colors.primary],
  });

  return (
    <View style={s.wrap}>
      <Text style={[s.label, focused && {color: colors.primary}]}>{label}</Text>
      <Animated.View style={[s.row, {borderColor}]}>
        <TextInput
          style={s.input}
          placeholderTextColor={colors.gray3}
          secureTextEntry={hidden}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} style={s.eye}>
            <Text style={s.eyeText}>{hidden ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {marginBottom: 16},
  label: {color: colors.gray2, fontSize: 13, fontWeight: '600', marginBottom: 6, letterSpacing: 0.4},
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16,
  },
  input: {flex: 1, color: colors.white, fontSize: 15, paddingVertical: 13},
  eye: {padding: 4},
  eyeText: {fontSize: 16},
  error: {color: colors.danger, fontSize: 12, marginTop: 4},
});
