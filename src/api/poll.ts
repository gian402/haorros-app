import {AppState} from 'react-native';
import {ApiError} from './client';

// Shared hosting does not require a persistent WebSocket process.
export function poll<T>(read: () => Promise<T>, onUpdate: (value: T) => void) {
  let stopped = false;
  let busy = false;
  const refresh = async () => {
    if (stopped || busy || AppState.currentState !== 'active') return;
    busy = true;
    try {
      const value = await read();
      if (!stopped) onUpdate(value);
    } catch (error) {
      if (error instanceof ApiError && [401, 403, 404].includes(error.status)) stop();
      // Transient failures retry on the next interval; never create unhandled rejections.
    } finally {busy = false;}
  };
  const timer = setInterval(refresh, 10000);
  const listener = AppState.addEventListener('change', state => {if (state === 'active') refresh();});
  function stop() {stopped = true; clearInterval(timer); listener.remove();}
  return {unsubscribe: stop};
}
