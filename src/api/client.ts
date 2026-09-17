import * as Keychain from 'react-native-keychain';
import {User} from '../types';
import config from './config.json';

export interface Session {
  access_token: string;
  user: User & {user_metadata: {name: string}};
}
const SERVICE = 'haorros.laravel.session';
let session: Session | null = null;
const listeners = new Set<(value: Session | null) => void>();

export class ApiError extends Error {
  constructor(message: string, public status: number) {super(message);}
}
export function onSessionChange(listener: (value: Session | null) => void) {
  listeners.add(listener);
  return () => {listeners.delete(listener);};
}
export async function saveSession(value: Session | null) {
  if (value) {
    await Keychain.setGenericPassword('session', JSON.stringify(value), {
      service: SERVICE, accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } else {
    await Keychain.resetGenericPassword({service: SERVICE});
  }
  session = value;
  listeners.forEach(listener => listener(value));
}
export async function restoreSession() {
  const saved = await Keychain.getGenericPassword({service: SERVICE});
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved.password) as Session;
    if (!parsed.access_token || !parsed.user?.id) throw new Error('Sesión inválida');
    session = parsed;
    return session;
  } catch {
    await saveSession(null);
    return null;
  }
}
export function makeSession(data: {access_token: string; user: User}): Session {
  return {...data, user: {...data.user, user_metadata: {name: data.user.name}}};
}
export async function updateSessionUser(user: User) {
  if (session) await saveSession(makeSession({access_token: session.access_token, user}));
}
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  if (!baseUrl) throw new ApiError('Falta configurar la dirección del servidor de Haorros.', 0);
  if (!__DEV__ && !baseUrl.startsWith('https://')) {
    throw new ApiError('El servidor debe utilizar HTTPS.', 0);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const token = session?.access_token;
  const form = body instanceof FormData;
  try {
    const response = await fetch(baseUrl + path, {
      method, signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(token ? {Authorization: 'Bearer ' + token} : {}),
        ...(body !== undefined && !form ? {'Content-Type': 'application/json'} : {}),
      },
      body: body === undefined ? undefined : form ? body as FormData : JSON.stringify(body),
    });
    const text = await response.text();
    let data: any;
    try {data = text ? JSON.parse(text) : undefined;} catch {
      throw new ApiError('El servidor devolvió una respuesta inesperada.', response.status);
    }
    if (!response.ok) {
      if (response.status === 401 && token && session?.access_token === token) await saveSession(null);
      const validation = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
      const message = response.status === 403 ? 'No tienes permiso para realizar esta acción.'
        : response.status === 429 ? 'Demasiados intentos. Espera un minuto.'
        : response.status >= 500 ? 'El servidor no está disponible. Intenta de nuevo.'
        : validation || data?.message || 'No se pudo completar la operación.';
      throw new ApiError(String(message), response.status);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('No se pudo conectar al servidor. Revisa tu conexión e intenta de nuevo.', 0);
  } finally {clearTimeout(timeout);}
}
export function imageForm(uri: string) {
  const ext = (uri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const form = new FormData();
  form.append('file', {uri, name: 'photo.' + (mime === 'image/jpeg' ? 'jpg' : ext), type: mime} as unknown as Blob);
  return form;
}
