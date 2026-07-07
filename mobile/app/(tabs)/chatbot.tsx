import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, Animated, Easing, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatMessage from '../../components/ChatMessage';
import ProductCard from '../../components/ProductCard';
import ChatInput from '../../components/ChatInput';
import SidebarDrawer from '../../components/SidebarDrawer';
import { chatApi } from '../../utils/api';
import { getUser, logout } from '../../utils/storage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  agentType?: string;
  products?: any[];
  category?: string;
  budget?: number;
}

const SESSION_ID = `mobile-session-${Date.now()}`;
const ROLES = ["Advisor", "Price Tracker", "Spec Analyst", "Deal Finder"];
const QUICK_PROMPTS = [
  'Best coding laptop under ₹50,000 with good battery',
  'Compare iPhone 15 vs Samsung S24 for photography',
  'Suggest 4K Smart TVs under ₹40,000 with Dolby Vision',
  'Top gaming headphones under ₹5,000',
];

export default function ChatbotScreen() {
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [roleIdx, setRoleIdx] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingText, setEditingText] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cancelRef = useRef(false);
  const listRef = useRef<FlatList>(null);

  // Load user
  useEffect(() => {
    getUser().then(setUser);
  }, []);

  // Cycling roles animation (every 2s)
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.ease,
      }).start(() => {
        setRoleIdx((prev) => (prev + 1) % ROLES.length);
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.ease,
        }).start();
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle incoming prompt from category cards
  useEffect(() => {
    if (prompt && messages.length === 0) {
      handleSend(prompt as string);
    }
  }, [prompt]);

  const scrollToBottom = () => {
    listRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setEditingText('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    cancelRef.current = false;

    setTimeout(scrollToBottom, 100);

    try {
      const localStr = await AsyncStorage.getItem('@shopbot_recent_searches');
      let list = localStr ? JSON.parse(localStr) : [];
      list = [text.trim(), ...list.filter((i: string) => i !== text.trim())].slice(0, 15);
      await AsyncStorage.setItem('@shopbot_recent_searches', JSON.stringify(list));
    } catch (_) {}

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await chatApi.send(text.trim(), SESSION_ID, history);
      if (cancelRef.current) return;

      const data = res.data;
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        text: data.message || data.response || "I couldn't process that. Please try again.",
        sender: 'ai',
        agentType: data.agentType,
        products: data.products || [],
        category: data.category,
        budget: data.budget,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      if (!cancelRef.current) {
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          text: `Sorry, I couldn't reach the server. Please ensure the backend is running.\n\nError: ${err?.message || 'Network error'}`,
          sender: 'ai',
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      if (!cancelRef.current) {
        setIsLoading(false);
        setTimeout(scrollToBottom, 200);
      }
    }
  }, [messages, isLoading]);

  const handleCancel = () => {
    cancelRef.current = true;
    setIsLoading(false);
  };

  const handleSpeak = (text: string, msgId: string) => {
    if (speakingId === msgId) {
      Speech.stop();
      setSpeakingId(null);
      return;
    }
    Speech.stop();
    const cleaned = text.replace(/[#*`[\]()>_~|]/g, '').slice(0, 3000);
    Speech.speak(cleaned, {
      language: 'en-IN',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setSpeakingId(null),
      onStopped: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
    setSpeakingId(msgId);
  };

  const handleClearChat = () => {
    Alert.alert('Clear Chat', 'Start a new conversation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setMessages([]) },
    ]);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View className="px-4">
      <ChatMessage
        message={item}
        userName={user?.name}
        onSpeak={item.sender === 'ai' ? (t) => handleSpeak(t, item.id) : undefined}
        onCopy={async (txt) => {
          await Clipboard.setStringAsync(txt);
          Alert.alert('Copied!', 'Message copied to clipboard.');
        }}
        onEdit={item.sender === 'user' ? (txt) => setEditingText(txt) : undefined}
      />

      {/* Product cards */}
      {item.sender === 'ai' && item.products && item.products.length > 0 && (
        <View className="mb-4">
          <View className="border-b border-zinc-800/80 pb-3 mb-4">
            <Text
              className="text-2xl text-white"
              style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
            >
              Curated Selection
            </Text>
            <Text className="text-xs text-zinc-500 mt-1 font-light" style={{ fontFamily: 'Inter_400Regular' }}>
              Handpicked recommendations
              {item.category ? ` for ${item.category}` : ''}
              {item.budget ? ` · Budget: ₹${item.budget.toLocaleString('en-IN')}` : ''}
            </Text>
          </View>

          {item.products.map((prod: any, pIdx: number) => (
            <ProductCard
              key={prod.id || prod.asin || `prod-${pIdx}`}
              product={prod}
              index={pIdx}
              allProducts={item.products}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3 border-b border-zinc-800/80">
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            onPress={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 items-center justify-center"
          >
            <Feather name="menu" size={18} color="#fafafa" />
          </TouchableOpacity>

          <View>
            <Text
              className="text-2xl text-white"
              style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
            >
              ShopBot AI
            </Text>
            <Text className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
              Personal Shopping Concierge
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2.5">
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={handleClearChat}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
            >
              <Feather name="refresh-ccw" size={15} color="#71717a" />
            </TouchableOpacity>
          )}
          {user ? (
            <View className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
              <Text className="text-white text-xs font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                {user.name?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center">
              <Feather name="user" size={15} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Message list / Website Landing state */}
      {messages.length === 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 28 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Upper part: Luxury Website Hero */}
          <View className="items-center mt-6">
            <Text className="text-[11px] text-zinc-500 uppercase tracking-[0.3em] font-semibold mb-6 text-center" style={{ fontFamily: 'Inter_600SemiBold' }}>
              SHOPBOT · AI SHOPPING ASSISTANT
            </Text>
            <Text
              className="text-7xl text-white text-center leading-[0.9] mb-6"
              style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
            >
              ShopBot AI
            </Text>

            <View className="flex-row items-center justify-center flex-wrap gap-1.5 mb-6">
              <Text className="text-zinc-400 text-lg" style={{ fontFamily: 'Inter_400Regular' }}>
                Your Smart
              </Text>
              <Animated.Text
                style={{ opacity: fadeAnim, fontFamily: 'InstrumentSerif_400Regular_Italic' }}
                className="text-white text-xl"
              >
                {ROLES[roleIdx]}
              </Animated.Text>
              <Text className="text-zinc-400 text-lg" style={{ fontFamily: 'Inter_400Regular' }}>
                Advisor
              </Text>
            </View>

            <Text className="text-zinc-400 text-sm text-center max-w-sm leading-relaxed font-light" style={{ fontFamily: 'Inter_400Regular' }}>
              Experience next-gen AI shopping. We compare prices across Flipkart, Amazon, Croma, Reliance Digital & Vijay Sales in real-time with AI-driven scoring & hardware spec analysis.
            </Text>
          </View>

          {/* Bottom part: Website Quick Action Chips */}
          <View className="mt-8 mb-2">
            <Text className="text-[10px] text-zinc-500 uppercase tracking-widest text-center mb-3" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Suggested Searches
            </Text>
            <View className="flex-row flex-wrap gap-2.5 justify-center">
              {QUICK_PROMPTS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => handleSend(p)}
                  activeOpacity={0.8}
                  className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2.5"
                >
                  <Text className="text-zinc-300 text-xs text-center" style={{ fontFamily: 'Inter_400Regular' }}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />
      )}

      {/* Typing indicator */}
      {isLoading && (
        <View className="px-4 pb-2">
          <View className="flex-row gap-3">
            <View className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center mt-1">
              <Text className="text-white text-base" style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>
                SB
              </Text>
            </View>
            <View className="bg-zinc-950 border border-zinc-800/80 rounded-3xl rounded-tl-sm px-4 py-3 flex-row items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <View key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Chat Input */}
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        onCancel={handleCancel}
        initialText={editingText}
      />

      {/* Sidebar Drawer Modal */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={() => {
          setMessages([]);
          setEditingText('');
        }}
        onSelectHistoryItem={(txt) => handleSend(txt)}
        user={user}
        onLogin={() => router.push('/auth')}
        onLogout={() => {
          logout();
          setUser(null);
          Alert.alert('Logged Out', 'You have been logged out.');
        }}
      />
    </SafeAreaView>
  );
}
