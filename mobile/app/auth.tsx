import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authApi } from '../utils/api';
import { saveTokens, saveUser } from '../utils/storage';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'register' && !form.name.trim()) {
      setError('Full name is required for registration.');
      return;
    }
    setLoading(true);
    try {
      const res =
        mode === 'login'
          ? await authApi.login(form.email.trim(), form.password)
          : await authApi.register(form.name.trim(), form.email.trim(), form.password, form.phone || undefined);

      const { accessToken, refreshToken, user } = res.data;
      await saveTokens(accessToken, refreshToken);
      await saveUser(user);
      router.back();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(' | ')
          : 'Authentication failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950/90" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
          >
            <Feather name="x" size={16} color="#71717a" />
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <Text
              className="text-4xl text-white mb-2"
              style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
            >
              {mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </Text>
            <Text className="text-zinc-500 text-sm font-light" style={{ fontFamily: 'Inter_400Regular' }}>
              {mode === 'login'
                ? 'Sign in to your ShopBot AI account'
                : 'Create your ShopBot AI account'}
            </Text>
          </View>

          {/* Mode toggle */}
          <View className="flex-row bg-zinc-900 border border-zinc-800 rounded-2xl p-1 mb-6">
            {(['login', 'register'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl items-center ${mode === m ? 'bg-white' : ''}`}
              >
                <Text
                  className={`text-sm font-semibold ${mode === m ? 'text-black' : 'text-zinc-500'}`}
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View className="gap-3 mb-4">
            {mode === 'register' && (
              <View>
                <Text className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Full Name
                </Text>
                <TextInput
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="Avi Sharma"
                  placeholderTextColor="#52525b"
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white text-sm"
                  style={{ fontFamily: 'Inter_400Regular' }}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View>
              <Text className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Email Address
              </Text>
              <TextInput
                value={form.email}
                onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="you@example.com"
                placeholderTextColor="#52525b"
                className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white text-sm"
                style={{ fontFamily: 'Inter_400Regular' }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {mode === 'register' && (
              <View>
                <Text className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Phone (Optional)
                </Text>
                <TextInput
                  value={form.phone}
                  onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#52525b"
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white text-sm"
                  style={{ fontFamily: 'Inter_400Regular' }}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View>
              <Text className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 ml-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Password
              </Text>
              <TextInput
                value={form.password}
                onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                placeholder="••••••••"
                placeholderTextColor="#52525b"
                secureTextEntry
                className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white text-sm"
                style={{ fontFamily: 'Inter_400Regular' }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </View>
          </View>

          {/* Error */}
          {!!error && (
            <View className="bg-red-950/40 border border-red-900/60 rounded-2xl px-4 py-3 mb-4">
              <Text className="text-red-400 text-xs font-light" style={{ fontFamily: 'Inter_400Regular' }}>
                {error}
              </Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            className="bg-white rounded-2xl py-4 items-center justify-center mb-4"
            style={{
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text className="text-black text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'Inter_700Bold' }}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-zinc-600 text-xs text-center font-light" style={{ fontFamily: 'Inter_400Regular' }}>
            By continuing, you agree to ShopBot AI's Terms of Service.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
