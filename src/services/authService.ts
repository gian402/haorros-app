import {api, imageForm, makeSession, saveSession, updateSessionUser} from '../api/client';
import {User} from '../types';

export const authService = {
  async signIn(email: string, password: string) {
    const data = await api<{access_token: string; user: User}>('/auth/login', 'POST', {email, password});
    await saveSession(makeSession(data));
    return data;
  },
  async signUp(email: string, password: string, name: string) {
    const data = await api<{access_token: string; user: User}>('/auth/register', 'POST', {email, password, name});
    await saveSession(makeSession(data));
    return data;
  },
  async getProfile(_userId: string) {return api<User>('/auth/me');},
  async updateName(name: string) {
    const user = await api<User>('/auth/profile', 'PATCH', {name});
    await updateSessionUser(user);
  },
  async uploadAvatar(uri: string) {
    const user = await api<User>('/auth/avatar', 'POST', imageForm(uri));
    await updateSessionUser(user);
    return user.avatar_url ?? null;
  },
  async changePassword(currentPassword: string, password: string) {
    await api('/auth/password', 'POST', {current_password: currentPassword, password, password_confirmation: password});
  },
  async forgotPassword(email: string) {await api('/auth/forgot-password', 'POST', {email});},
};
