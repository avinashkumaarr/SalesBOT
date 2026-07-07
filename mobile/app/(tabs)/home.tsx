import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, Easing, Image, Dimensions, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import SidebarDrawer from '../../components/SidebarDrawer';
import { getUser, logout } from '../../utils/storage';

const { width } = Dimensions.get('window');

const ROLES = ['Amazon & Flipkart', 'Croma & Reliance', 'Price Drop Alert', 'AI Score 9.8/10'];

const PROJECTS = [
  {
    id: 1,
    title: "Coding & AI Laptops",
    category: "Laptops & PCs",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80",
    tags: ["16GB RAM", "512GB SSD", "Ryzen 5 / i5", "Under ₹40k"],
    desc: "Search for high-performance laptops optimized for Android Studio, VS Code, and college research with long-lasting battery backup.",
    prompt: "Find the best coding laptops under 40000 with 16GB RAM and good battery"
  },
  {
    id: 2,
    title: "5G Camera Flagships",
    category: "Smartphones & Mobiles",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80",
    tags: ["5G Ready", "120Hz AMOLED", "Fast Charging", "Bank EMI"],
    desc: "Compare AMOLED displays, Snapdragon processors, and 108MP cameras with live multi-store pricing across Amazon and Flipkart.",
    prompt: "Best 5G smartphones under 25000 with camera and good battery"
  },
  {
    id: 3,
    title: "ANC Earbuds & Watches",
    category: "Audio & Wearables",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
    tags: ["ANC Support", "AMOLED Display", "Long Battery", "Under ₹5k"],
    desc: "Discover Active Noise Cancelling TWS earbuds and fitness smartwatches with heart rate tracking and crisp AMOLED displays.",
    prompt: "Best ANC earbuds and smartwatches under 5000"
  },
  {
    id: 4,
    title: "4K TVs & Home Audio",
    category: "Home Entertainment",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80",
    tags: ["4K Ultra HD", "Dolby Vision", "Smart OS", "Best Deals"],
    desc: "Find OLED & QLED 4K televisions with Dolby Vision and Dolby Atmos sound systems at the lowest online prices.",
    prompt: "Best 4K Smart TVs under 40000 with Dolby Atmos"
  }
];

const ENTRIES = [
  {
    id: 1,
    title: "How AI Score Ranks Laptops for B.Tech & Coding Students",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80",
    readTime: "4 min read",
    date: "July 2026",
    prompt: "Explain how AI Score ranks laptops for coding under 40000"
  },
  {
    id: 2,
    title: "Decoding Smartphone Camera Sensors: 108MP vs Sony IMX Flagships",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80",
    readTime: "6 min read",
    date: "June 2026",
    prompt: "Compare best smartphone camera sensors under 25000"
  },
  {
    id: 3,
    title: "Active Noise Cancellation (ANC) Under ₹5,000: What Really Works?",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
    readTime: "5 min read",
    date: "May 2026",
    prompt: "Explain Active Noise Cancellation earbuds under 5000"
  },
  {
    id: 4,
    title: "OLED vs QLED: Choosing the Perfect 4K TV for Dolby Vision & Atmos",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80",
    readTime: "7 min read",
    date: "April 2026",
    prompt: "Explain OLED vs QLED 4K TVs under 40000"
  }
];

const SHOWCASE_ITEMS = [
  { 
    id: 1, 
    title: "AI Coding Laptops", 
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80", 
    prompt: "Best coding laptops under 40000 with 16GB RAM and good battery",
    desc: "Compare Ryzen 5 & Core i5 laptops optimized for development."
  },
  { 
    id: 2, 
    title: "5G Camera Mobiles", 
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80", 
    prompt: "Best 5G smartphones under 25000 with camera and good battery",
    desc: "120Hz AMOLED displays and 108MP camera sensors."
  },
  { 
    id: 3, 
    title: "ANC Earbuds & Watches", 
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80", 
    prompt: "Best ANC earbuds and smartwatches under 5000",
    desc: "Active Noise Cancelling TWS earbuds & fitness smartwatches."
  },
  { 
    id: 4, 
    title: "4K OLED Smart TVs", 
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80", 
    prompt: "Best 4K Smart TVs under 40000 with Dolby Atmos",
    desc: "Dolby Vision & Dolby Atmos home theater setups."
  },
  { 
    id: 5, 
    title: "Gaming Workstations", 
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=80", 
    prompt: "Best gaming PCs and monitors under 60000",
    desc: "High-FPS gaming rigs and dual curved monitors."
  },
  { 
    id: 6, 
    title: "Smart Home & IoT", 
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80", 
    prompt: "Best smart speakers and home automation devices under 5000",
    desc: "Voice-controlled AI speakers and smart lighting."
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [roleIdx, setRoleIdx] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

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
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchShopBot = (promptQuery?: string) => {
    if (promptQuery) {
      router.push({ pathname: '/', params: { prompt: promptQuery } });
    } else {
      router.push('/');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      {/* Top Header with Hamburger Menu */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3 border-b border-zinc-800/80 bg-zinc-950 z-10">
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
              Home Section
            </Text>
          </View>
        </View>

        {user ? (
          <View className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
            <Text className="text-white text-xs font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/auth')}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
          >
            <Feather name="user" size={15} color="#71717a" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* 1. HERO SECTION */}
        <View className="min-h-[65vh] items-center justify-center px-6 pt-10 pb-16 relative border-b border-zinc-800/40">
          <View className="flex-row items-center gap-2 mb-6">
            <View className="w-8 h-px bg-zinc-700" />
            <Text
              className="text-[11px] text-zinc-400 uppercase tracking-[0.3em]"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              India's AI Shopping Brain
            </Text>
            <View className="w-8 h-px bg-zinc-700" />
          </View>

          <Text
            className="text-7xl text-white text-center leading-[0.9] mb-4"
            style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
          >
            ShopBot{'\n'}AI
          </Text>

          <View className="flex-row items-center flex-wrap justify-center gap-1.5 mb-6">
            <Text className="text-zinc-400 text-base" style={{ fontFamily: 'Inter_400Regular' }}>
              Searching
            </Text>
            <Animated.Text
              style={{ opacity: fadeAnim, fontFamily: 'InstrumentSerif_400Regular_Italic' }}
              className="text-white text-lg"
            >
              {ROLES[roleIdx]}
            </Animated.Text>
            <Text className="text-zinc-400 text-base" style={{ fontFamily: 'Inter_400Regular' }}>
              across 50+ stores.
            </Text>
          </View>

          <Text
            className="text-zinc-400 text-sm text-center max-w-xs leading-relaxed mb-10"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            India's most intelligent e-commerce shopping assistant. Compare live prices, enforce strict budgets, analyze specs with Gemini AI, and speak your searches instantly.
          </Text>

          <View className="gap-3 w-full max-w-xs">
            <TouchableOpacity
              onPress={() => handleLaunchShopBot()}
              activeOpacity={0.85}
              className="bg-white rounded-full py-4 items-center justify-center"
              style={{
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-black text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'Inter_700Bold' }}>
                ⚡ Launch AI Assistant ↗
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollViewRef.current?.scrollTo({ y: 550, animated: true })}
              activeOpacity={0.8}
              className="border border-zinc-700 rounded-full py-3.5 items-center justify-center bg-zinc-900"
            >
              <Text className="text-zinc-300 text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Explore Categories ↓
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. STATS ROW */}
        <View className="flex-row px-6 gap-3 py-10 border-b border-zinc-800/40 bg-zinc-900/20">
          {[
            { num: '50+', label: 'Stores Tracked' },
            { num: '2.5M+', label: 'Products Indexed' },
            { num: '9.8/10', label: 'AI Accuracy' },
          ].map((s, i) => (
            <View key={i} className="flex-1 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 items-center shadow-sm">
              <Text className="text-white text-xl font-bold" style={{ fontFamily: 'Inter_700Bold' }}>{s.num}</Text>
              <Text className="text-zinc-500 text-[9px] text-center mt-1 uppercase tracking-widest" style={{ fontFamily: 'Inter_600SemiBold' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* 3. SELECTED WORKS (WHAT YOU CAN SEARCH) */}
        <View className="px-6 py-14 border-b border-zinc-800/40">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-6 h-px bg-zinc-700" />
            <Text className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]" style={{ fontFamily: 'Inter_600SemiBold' }}>
              ShopBot AI Search
            </Text>
          </View>
          <Text className="text-4xl text-white mb-2" style={{ fontFamily: 'Inter_400Regular' }}>
            What you can <Text style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>search</Text>
          </Text>
          <Text className="text-zinc-400 text-xs mb-8 leading-relaxed font-light" style={{ fontFamily: 'Inter_400Regular' }}>
            Explore our intelligent product categories. Tap any card to instantly launch ShopBot AI and compare live prices across India.
          </Text>

          <View className="gap-6">
            {PROJECTS.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => handleLaunchShopBot(project.prompt)}
                activeOpacity={0.9}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl"
              >
                <Image
                  source={{ uri: project.image }}
                  style={{ width: '100%', height: 200 }}
                  resizeMode="cover"
                />
                <View className="p-6">
                  <Text className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-bold mb-1" style={{ fontFamily: 'Inter_700Bold' }}>
                    {project.category}
                  </Text>
                  <Text className="text-2xl text-white mb-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    {project.title}
                  </Text>
                  <Text className="text-zinc-400 text-xs leading-relaxed mb-4" style={{ fontFamily: 'Inter_400Regular' }}>
                    {project.desc}
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5 mb-5">
                    {project.tags.map((t, idx) => (
                      <View key={idx} className="bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                        <Text className="text-[10px] text-zinc-300" style={{ fontFamily: 'Inter_400Regular' }}>{t}</Text>
                      </View>
                    ))}
                  </View>
                  <View className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex-row items-center gap-2">
                    <Text className="text-sm">🔍</Text>
                    <Text className="text-zinc-300 text-xs flex-1 font-medium leading-snug" style={{ fontFamily: 'Inter_600SemiBold' }}>
                      Tap to Search: <Text className="italic font-normal text-white">"{project.prompt}"</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. JOURNAL (RECENT THOUGHTS) */}
        <View className="px-6 py-14 border-b border-zinc-800/40 bg-zinc-900/10">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-6 h-px bg-zinc-700" />
            <Text className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]" style={{ fontFamily: 'Inter_600SemiBold' }}>
              AI Shopping Insights
            </Text>
          </View>
          <Text className="text-4xl text-white mb-2" style={{ fontFamily: 'Inter_400Regular' }}>
            Recent <Text style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>thoughts</Text>
          </Text>
          <Text className="text-zinc-400 text-xs mb-8 leading-relaxed font-light" style={{ fontFamily: 'Inter_400Regular' }}>
            Insights on Indian E-commerce, AI shopping algorithms, and smart consumer tech. Tap any topic to ask ShopBot AI!
          </Text>

          <View className="gap-4">
            {ENTRIES.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() => handleLaunchShopBot(entry.prompt)}
                activeOpacity={0.8}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex-row items-center gap-4"
              >
                <Image
                  source={{ uri: entry.image }}
                  style={{ width: 64, height: 64, borderRadius: 16 }}
                  resizeMode="cover"
                />
                <View className="flex-1 justify-center">
                  <Text className="text-white text-sm font-semibold mb-1 leading-snug" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    {entry.title}
                  </Text>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-[10px] text-cyan-400 font-semibold">⚡ Ask ShopBot AI</Text>
                    <Text className="text-[10px] text-zinc-500">{entry.readTime}</Text>
                  </View>
                </View>
                <Feather name="arrow-up-right" size={18} color="#06b6d4" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. EXPLORATIONS (LIVE PRODUCT SHOWCASE) */}
        <View className="px-6 py-14 border-b border-zinc-800/40">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-6 h-px bg-zinc-700" />
            <Text className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]" style={{ fontFamily: 'Inter_600SemiBold' }}>
              ShopBot AI Gallery
            </Text>
          </View>
          <Text className="text-4xl text-white mb-2" style={{ fontFamily: 'Inter_400Regular' }}>
            Live Product <Text style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>Showcase</Text>
          </Text>
          <Text className="text-zinc-400 text-xs mb-8 leading-relaxed font-light" style={{ fontFamily: 'Inter_400Regular' }}>
            An interactive visual archive of top-rated consumer tech, gaming workstations, and AI devices. Tap any item to compare!
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-5">
            {SHOWCASE_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleLaunchShopBot(item.prompt)}
                activeOpacity={0.85}
                style={{ width: (width - 60) / 2 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-md"
              >
                <Image
                  source={{ uri: item.image }}
                  style={{ width: '100%', height: 140 }}
                  resizeMode="cover"
                />
                <View className="p-3.5">
                  <Text className="text-white text-xs font-bold mb-1" style={{ fontFamily: 'Inter_700Bold' }}>
                    {item.title}
                  </Text>
                  <Text className="text-zinc-400 text-[10px] leading-relaxed mb-2 line-clamp-2" style={{ fontFamily: 'Inter_400Regular' }}>
                    {item.desc}
                  </Text>
                  <Text className="text-[9px] text-cyan-400 font-bold tracking-wide">
                    ⚡ Tap to compare
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. WHY SHOPBOT AI (FEATURES) */}
        <View className="px-6 py-14 border-b border-zinc-800/40 bg-zinc-900/10">
          <View className="flex-row items-center gap-3 mb-5">
            <View className="w-6 h-px bg-zinc-700" />
            <Text className="text-[10px] text-zinc-500 uppercase tracking-[0.25em]" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Why ShopBot AI
            </Text>
          </View>
          <View className="gap-3">
            {[
              { icon: 'bar-chart-2', title: 'Live Multi-Store Price', desc: 'Real-time prices from Amazon, Flipkart, Croma, Reliance Digital & Vijay Sales' },
              { icon: 'trending-up', title: 'Price History Tracking', desc: 'See historical price trends via PriceHistory.app to time your purchase perfectly' },
              { icon: 'shield', title: 'Strict Budget Enforcement', desc: 'Gemini AI never suggests products over your stated budget — guaranteed' },
              { icon: 'mic', title: 'Voice Search', desc: 'Speak your requirements naturally — full Hindi & English support' },
            ].map((f, i) => (
              <View key={i} className="flex-row items-start gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
                <View className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 items-center justify-center flex-shrink-0 mt-0.5">
                  <Feather name={f.icon as any} size={16} color="#a1a1aa" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-semibold mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    {f.title}
                  </Text>
                  <Text className="text-zinc-400 text-xs leading-relaxed font-light" style={{ fontFamily: 'Inter_400Regular' }}>
                    {f.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 7. FOOTER */}
        <View className="px-6 pt-10 items-center justify-center">
          <Text className="text-zinc-600 text-xs font-light text-center" style={{ fontFamily: 'Inter_400Regular' }}>
            ShopBot AI © 2026. Built with Gemini AI & Expo.
          </Text>
          <Text className="text-zinc-700 text-[10px] text-center mt-1 uppercase tracking-widest" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Luxury E-Commerce Intelligence
          </Text>
        </View>

      </ScrollView>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={() => router.push('/')}
        onSelectHistoryItem={(item) => {
          router.push({ pathname: '/', params: { loadSessionId: item.sessionId || '', prompt: item.title } });
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
