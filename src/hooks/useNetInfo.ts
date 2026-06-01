import {useEffect, useState} from 'react';
import {AppState} from 'react-native';

export function useNetInfo() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('https://www.google.com/generate_204', {method: 'HEAD'});
        if (!cancelled) setIsConnected(res.ok);
      } catch {
        if (!cancelled) setIsConnected(false);
      }
    };
    check();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') check();
    });
    return () => {cancelled = true; sub.remove();};
  }, []);

  return isConnected;
}
