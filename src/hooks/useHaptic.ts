import {Platform, Vibration} from 'react-native';

export function haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  const patterns: Record<string, number> = {light: 30, medium: 60, heavy: 100};
  Vibration.vibrate(patterns[type]);
}
