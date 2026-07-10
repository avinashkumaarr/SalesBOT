import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getAccessToken } from './storage';

// Dynamically resolve the backend host:
// 1. Check if Expo Metro bundler provided a host IP during local development
// 2. Fallback to the live production Render HTTPS server for standalone APKs and physical devices
export const getBackendHost = () => {
  const metroHost =
    Constants.expoConfig?.hostUri?.split(':')[0] ||
    (Constants as any).manifest?.debuggerHost?.split(':')[0] ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost?.split(':')[0];

  if (metroHost) {
    return `http://${metroHost}:3001/api`;
  }
  // Standalone APK (app-debug.apk / production): ALWAYS connect to exact live production Render backend over HTTPS
  return 'https://salesbot-fqjx.onrender.com/api';
};

export const BASE_URL = getBackendHost();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, phone?: string) =>
    api.post('/auth/register', { name, email, password, ...(phone ? { phone } : {}) }),
};

// Chat endpoint
export const chatApi = {
  send: (
    message: string,
    sessionId: string,
    history: { role: string; content: string }[]
  ) =>
    api.post('/chat', { message, sessionId, history }),
  history: (sessionId?: string) =>
    api.get('/chat/history', { params: sessionId ? { sessionId } : {} }),
};

// Product redirect URL builder (same logic as frontend)
export const getRedirectUrl = (store: string, title: string) =>
  `${BASE_URL.replace('/api', '')}/api/products/redirect?store=${encodeURIComponent(store)}&title=${encodeURIComponent(title)}`;

export default api;
