import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, Animated, Easing, ScrollView, KeyboardAvoidingView, Platform, Keyboard
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

const INITIAL_SESSION_ID = `mobile-session-${Date.now()}`;
const ROLES = ["Advisor", "Price Tracker", "Spec Analyst", "Deal Finder"];
const QUICK_PROMPTS = [
  'Best coding laptop under ₹50,000 with good battery',
  'Compare iPhone 15 vs Samsung S24 for photography',
  'Suggest 4K Smart TVs under ₹40,000 with Dolby Vision',
  'Top gaming headphones under ₹5,000',
];

export default function ChatbotScreen() {
  const { prompt, loadSessionId } = useLocalSearchParams<{ prompt?: string; loadSessionId?: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>(INITIAL_SESSION_ID);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [roleIdx, setRoleIdx] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cancelRef = useRef(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Load user
  useEffect(() => {
    getUser().then(setUser).catch(() => {});
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

  const scrollToBottom = () => {
    listRef.current?.scrollToEnd({ animated: true });
  };

  const loadSessionById = async (sid: string) => {
    if (!sid) return;
    setSessionId(sid);
    setIsLoading(true);
    try {
      const res = await chatApi.history(sid);
      if (res.data?.success && Array.isArray(res.data.messages) && res.data.messages.length > 0) {
        const loadedMsgs = res.data.messages.map((m: any, idx: number) => ({
          id: `m-${sid}-${idx}`,
          sender: m.role === 'user' || m.role === 'client' ? 'user' : 'ai',
          text: m.content || m.message || '',
          agentType: m.agentType || 'SALES',
          timestamp: m.timestamp || m.createdAt || new Date().toISOString(),
          products: m.metadata?.products || [],
          category: m.metadata?.category,
          budget: m.metadata?.budget,
        }));
        setMessages(loadedMsgs);
      }
    } catch (e) {
      console.log('Error loading session by ID:', e);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 200);
    }
  };

  // Handle incoming prompt or loadSessionId from navigation
  useEffect(() => {
    if (loadSessionId) {
      loadSessionById(loadSessionId as string);
    } else if (prompt && messages.length === 0) {
      handleSend(prompt as string);
    }
  }, [prompt, loadSessionId]);

  // Save active session locally whenever messages update
  useEffect(() => {
    if (messages.length === 0) return;
    const saveSessionLocally = async () => {
      try {
        const stored = await AsyncStorage.getItem('@shopbot_sessions');
        let sessionsList: any[] = stored ? JSON.parse(stored) : [];
        const title = messages[0]?.text?.slice(0, 40) || 'Chat Session';
        const sessionObj = {
          sessionId: sessionId,
          title: title,
          date: new Date().toLocaleDateString(),
          messages: messages,
          updatedAt: Date.now(),
        };
        sessionsList = [sessionObj, ...sessionsList.filter((s: any) => s.sessionId !== sessionId)].slice(0, 25);
        await AsyncStorage.setItem('@shopbot_sessions', JSON.stringify(sessionsList));
      } catch (_) {}
    };
    saveSessionLocally();
  }, [messages, sessionId]);

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

      const res = await chatApi.send(text.trim(), sessionId, history);
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
  }, [messages, isLoading, sessionId]);

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
      { text: 'Clear', style: 'destructive', onPress: () => {
        setMessages([]);
        setSessionId(`mobile-session-${Date.now()}`);
      }},
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
              SalesBOT
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Upper part: Luxury Website Hero */}
          <View className="items-center mt-6">
            <Text className="text-[11px] text-zinc-500 uppercase tracking-[0.3em] font-semibold mb-6 text-center" style={{ fontFamily: 'Inter_600SemiBold' }}>
              SALESBOT · AI SHOPPING ASSISTANT
            </Text>
            <Text
              className="text-7xl text-white text-center leading-[0.9] mb-6"
              style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
            >
              SalesBOT AI
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

          {/* Middle part: Quick Prompts */}
          <View className="my-8">
            <Text className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-3 text-center" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Popular Searches
            </Text>
            <View className="gap-2.5">
              {QUICK_PROMPTS.map((qp, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSend(qp)}
                  activeOpacity={0.7}
                  className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl py-3.5 px-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-sm">✨</Text>
                    <Text className="text-zinc-300 text-xs font-light flex-1" style={{ fontFamily: 'Inter_400Regular' }}>
                      {qp}
                    </Text>
                  </View>
                  <Feather name="arrow-up-right" size={14} color="#52525b" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom part: Stats footer */}
          <View className="flex-row justify-center gap-8 pt-4 border-t border-zinc-900/80">
            <View className="items-center">
              <Text className="text-white text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>50+</Text>
              <Text className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5 font-medium" style={{ fontFamily: 'Inter_500Medium' }}>Stores</Text>
            </View>
            <View className="w-px h-8 bg-zinc-800" />
            <View className="items-center">
              <Text className="text-white text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>2.5M+</Text>
              <Text className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5 font-medium" style={{ fontFamily: 'Inter_500Medium' }}>Products</Text>
            </View>
            <View className="w-px h-8 bg-zinc-800" />
            <View className="items-center">
              <Text className="text-white text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>9.8/10</Text>
              <Text className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5 font-medium" style={{ fontFamily: 'Inter_500Medium' }}>AI Score</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          className="flex-1"
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ListFooterComponent={
            isLoading ? (
              <View className="px-4 py-4 mb-2">
                <View className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl rounded-tl-sm p-4 w-32">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-zinc-400 font-light" style={{ fontFamily: 'Inter_400Regular' }}>
                      Thinking...
                    </Text>
                  </View>
                </View>
              </View>
            ) : null
          }
        />
      )}

      {/* Chat Input with explicit Keyboard Elevation */}
      <View style={{ paddingBottom: keyboardOffset }}>
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          onCancel={handleCancel}
          initialText={editingText}
        />
      </View>

      {/* Sidebar Drawer Modal */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={() => {
          setMessages([]);
          setEditingText('');
          setSessionId(`mobile-session-${Date.now()}`);
        }}
        onSelectHistoryItem={async (item) => {
          // 1. If we have saved messages (from local @shopbot_sessions or backend), load them immediately!
          if (item.messages && Array.isArray(item.messages) && item.messages.length > 0) {
            const loadedMsgs = item.messages.map((m: any, idx: number) => ({
              id: m.id || `m-local-${idx}`,
              sender: m.sender || (m.role === 'user' || m.role === 'client' ? 'user' : 'ai'),
              text: m.text || m.content || m.message || '',
              agentType: m.agentType || 'SALES',
              timestamp: m.timestamp || m.createdAt || new Date().toISOString(),
              products: m.products || m.metadata?.products || [],
              category: m.category || m.metadata?.category,
              budget: m.budget || m.metadata?.budget,
            }));
            setMessages(loadedMsgs);
            if (item.sessionId) setSessionId(item.sessionId);
            return;
          }
          // 2. If we have a sessionId without preloaded messages, fetch from backend!
          if (item.sessionId) {
            await loadSessionById(item.sessionId);
            return;
          }
          // 3. Fallback only if it's a bare string prompt without session or messages
          handleSend(item.title);
        }}
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
