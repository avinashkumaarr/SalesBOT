import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  ActivityIndicator, Platform, Dimensions, PanResponder
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatApi } from '../utils/api';
import { useRouter } from 'expo-router';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectHistoryItem: (text: string) => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

export default function SidebarDrawer({
  isOpen,
  onClose,
  onNewChat,
  onSelectHistoryItem,
  user,
  onLogin,
  onLogout,
}: SidebarDrawerProps) {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && gestureState.dx < -10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 || gestureState.vx < -0.5) {
          onClose();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      // 1. Get local recent searches
      const localStr = await AsyncStorage.getItem('@shopbot_recent_searches');
      let localList: string[] = localStr ? JSON.parse(localStr) : [];

      // 2. Try fetching backend history if logged in
      let backendList: any[] = [];
      if (user) {
        try {
          const res = await chatApi.history();
          if (res.data?.success && Array.isArray(res.data.history)) {
            backendList = res.data.history;
          }
        } catch (e) {
          // fallback to local silently
        }
      }

      // Combine and deduplicate
      const combined = [
        ...backendList.map(h => ({
          id: h._id || Math.random().toString(),
          title: h.title || h.message || h.query || 'Chat Session',
          date: h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Recent'
        })),
        ...localList.map((item, idx) => ({
          id: `local_${idx}`,
          title: item,
          date: 'Recent Search'
        }))
      ];

      // Deduplicate by title
      const seen = new Set();
      const unique = combined.filter(item => {
        const t = item.title.trim().toLowerCase();
        if (seen.has(t)) return false;
        seen.add(t);
        return true;
      });

      setHistoryItems(unique.slice(0, 20));
    } catch (err) {
      console.log('Error loading history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row" {...panResponder.panHandlers}>
        {/* Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0 bg-black"
          style={{ opacity: 0.75 }}
        />

        {/* Sidebar Panel */}
        <View className="w-[82%] max-w-[320px] bg-zinc-950 border-r border-zinc-800/80 h-full flex-col justify-between pt-12 pb-8 px-5 z-10">
          {/* Top Header & New Chat */}
          <View>
            <View className="flex-row items-center justify-between pb-4 border-b border-zinc-900">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl bg-white items-center justify-center shadow-md">
                  <Text className="text-black text-sm font-bold" style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>
                    SB
                  </Text>
                </View>
                <Text className="text-white text-xl" style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>
                  ShopBot AI
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-1.5 rounded-full bg-zinc-900">
                <Feather name="x" size={18} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            {/* + New Chat Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onNewChat();
                onClose();
              }}
              className="bg-white rounded-2xl py-3.5 px-4 flex-row items-center justify-center gap-2.5 mt-5"
              style={{
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Feather name="plus-circle" size={18} color="#000000" />
              <Text className="text-black text-sm font-bold tracking-wide uppercase" style={{ fontFamily: 'Inter_700Bold' }}>
                New Chat
              </Text>
            </TouchableOpacity>

            {/* Navigation Section (Home & Plans) */}
            <View className="mt-6 pt-4 border-t border-zinc-900/80">
              <Text className="text-[10px] text-zinc-500 font-semibold uppercase tracking-[0.2em] mb-2 px-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Navigation
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  router.push('/');
                }}
                className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-zinc-900"
              >
                <Feather name="home" size={16} color="#e4e4e7" />
                <Text className="text-zinc-200 text-sm font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                  Home Section
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  router.push('/chatbot');
                }}
                className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-zinc-900 mt-1"
              >
                <Feather name="message-circle" size={16} color="#34d399" />
                <Text className="text-zinc-200 text-sm font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                  ShopBot AI
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  router.push('/plans');
                }}
                className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-zinc-900 mt-1"
              >
                <Feather name="zap" size={16} color="#60a5fa" />
                <Text className="text-zinc-200 text-sm font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                  Upgrade Plans
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Middle Section: Chat History */}
          <View className="flex-1 mt-6 pt-4 border-t border-zinc-900/80 overflow-hidden">
            <Text className="text-[10px] text-zinc-500 font-semibold uppercase tracking-[0.2em] mb-3 px-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Chat History & Searches
            </Text>

            {loadingHistory ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" color="#71717a" />
              </View>
            ) : historyItems.length === 0 ? (
              <View className="py-8 px-2 items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-900">
                <Feather name="message-square" size={24} color="#3f3f46" />
                <Text className="text-zinc-500 text-xs text-center mt-2" style={{ fontFamily: 'Inter_400Regular' }}>
                  No recent conversations yet.{'\n'}Start searching to build history!
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {historyItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelectHistoryItem(item.title);
                      onClose();
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-3 mb-2 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <Feather name="message-circle" size={14} color="#71717a" />
                      <Text
                        numberOfLines={1}
                        className="text-zinc-200 text-xs font-medium flex-1"
                        style={{ fontFamily: 'Inter_500Medium' }}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Text className="text-[9px] text-zinc-500" style={{ fontFamily: 'Inter_400Regular' }}>
                      {item.date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Bottom Section: Account / Login */}
          <View className="pt-4 border-t border-zinc-900/80 mt-2">
            {user ? (
              <View className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
                    <Text className="text-white text-xs font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-white text-xs font-bold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                      {user.name || 'User'}
                    </Text>
                    <Text numberOfLines={1} className="text-zinc-400 text-[10px]" style={{ fontFamily: 'Inter_400Regular' }}>
                      {user.email || 'Free Tier'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    onLogout();
                    onClose();
                  }}
                  className="p-2 bg-zinc-800 rounded-xl"
                >
                  <Feather name="log-out" size={15} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onLogin();
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 px-4 flex-row items-center justify-center gap-2"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <Feather name="lock" size={16} color="#ffffff" />
                <Text className="text-white text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'Inter_700Bold' }}>
                  Sign In / Create Account
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
