import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'shopbot_access_token';
const REFRESH_KEY = 'shopbot_refresh_token';
const USER_KEY = 'shopbot_user';

// SecureStore is not available on web, fallback to memory
const memStore: Record<string, string> = {};

const set = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    memStore[key] = value;
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const get = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return memStore[key] ?? null;
  return SecureStore.getItemAsync(key);
};

const del = async (key: string) => {
  if (Platform.OS === 'web') {
    delete memStore[key];
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await set(TOKEN_KEY, accessToken);
  await set(REFRESH_KEY, refreshToken);
};

export const getAccessToken = () => get(TOKEN_KEY);
export const getRefreshToken = () => get(REFRESH_KEY);

export const saveUser = async (user: object) => {
  await set(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await get(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const clearAuth = async () => {
  await del(TOKEN_KEY);
  await del(REFRESH_KEY);
  await del(USER_KEY);
};
