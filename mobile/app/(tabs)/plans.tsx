import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import SidebarDrawer from '../../components/SidebarDrawer';
import { getUser, logout } from '../../utils/storage';

const PLANS = [
  {
    name: 'Starter Brain',
    badge: 'Free Forever',
    monthlyPrice: 0,
    annualPrice: 0,
    credits: '60 AI Search Credits / mo',
    description: 'Essential AI shopping assistant for casual online shoppers.',
    features: [
      'Live Multi-Store Price Comparison (5 Stores)',
      'Amazon, Flipkart, Croma & Reliance search',
      'Standard Mobile & Laptop spec analysis',
      'Weekly Price Drop Email Alerts',
      'Standard Voice Synthesis',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Pro Shopper',
    badge: 'Most Popular',
    monthlyPrice: 199,
    annualPrice: 159,
    credits: '450 AI Search Credits / mo',
    description: 'Advanced shopping intelligence for power buyers and tech enthusiasts.',
    features: [
      'Powered by Google Gemini 2.5 Pro & Live SerpAPI',
      'Real-Time WhatsApp & SMS Flash Sale Alerts',
      'Multimodal File Attachments',
      'Voice Search & Hindi/English Audio Synthesis',
      'Strict 100% Budget Enforcement Guarantee',
      'Priority Bank Coupon & Cashback Finder',
    ],
    cta: 'Upgrade to Pro Shopper',
    popular: true,
  },
  {
    name: 'Power Shopper',
    badge: 'Enterprise & Bulk',
    monthlyPrice: 499,
    annualPrice: 399,
    credits: 'Unlimited AI Search Credits',
    description: 'Ultimate AI procurement engine for bulk buyers and agencies.',
    features: [
      'Everything in Pro Shopper',
      'Custom API Access to ShopBot Engine',
      'Dedicated 24/7 Personal Shopping AI Agent',
      'Bulk Price Tracking across 100+ Indian Stores',
      'Early Access to Beta Features',
      'VIP Dedicated Support',
    ],
    cta: 'Contact Sales ↗',
    popular: false,
  },
];

export default function PlansScreen() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const handlePlanPress = (plan: typeof PLANS[0]) => {
    if (plan.monthlyPrice === 0) return;
    router.push('/chatbot');
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
              ShopBot AI
            </Text>
            <Text className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
              Upgrade Plans
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View className="px-6 pt-8 pb-6 border-b border-zinc-800/60">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-6 h-px bg-zinc-700" />
            <Text className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Flexible AI Subscriptions
            </Text>
          </View>
          <Text
            className="text-4xl text-white leading-tight mb-3"
            style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
          >
            Choose Your{'\n'}AI Shopping Power.
          </Text>
          <Text className="text-zinc-500 text-sm font-light leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>
            Unlock deeper price analytics, real-time alerts, and unlimited Gemini 2.5 Pro searches.
          </Text>
        </View>

        {/* Billing Toggle */}
        <View className="px-6 py-5">
          <View className="flex-row bg-zinc-900/80 border border-zinc-800 rounded-full p-1.5 self-start">
            <TouchableOpacity
              onPress={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full ${!isAnnual ? 'bg-white' : ''}`}
            >
              <Text
                className={`text-xs font-semibold ${!isAnnual ? 'text-black' : 'text-zinc-500'}`}
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full ${isAnnual ? 'bg-white' : ''}`}
            >
              <Text
                className={`text-xs font-semibold ${isAnnual ? 'text-black' : 'text-zinc-500'}`}
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Annual
              </Text>
            </TouchableOpacity>
          </View>
          {isAnnual && (
            <View className="mt-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 self-start">
              <Text className="text-white text-[10px] font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Save up to 20% with annual billing
              </Text>
            </View>
          )}
        </View>

        {/* Plan Cards */}
        <View className="px-6 gap-4">
          {PLANS.map((plan, idx) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <View
                key={plan.name}
                className={`rounded-3xl border p-6 ${
                  plan.popular
                    ? 'bg-zinc-900/80 border-white/20 shadow-lg'
                    : 'bg-zinc-900/40 border-zinc-800/60'
                }`}
              >
                {/* Plan header */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text
                    className="text-xl text-white"
                    style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
                  >
                    {plan.name}
                  </Text>
                  <View
                    className={`rounded-full px-3 py-1 ${
                      plan.popular ? 'bg-white' : 'bg-white/10 border border-white/10'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-wider ${plan.popular ? 'text-black' : 'text-zinc-400'}`}
                      style={{ fontFamily: 'Inter_700Bold' }}
                    >
                      {plan.badge}
                    </Text>
                  </View>
                </View>

                {/* Price */}
                <View className="flex-row items-baseline gap-1 mb-4">
                  <Text className="text-4xl text-white font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                    ₹{price}
                  </Text>
                  <Text className="text-xs text-zinc-500" style={{ fontFamily: 'Inter_400Regular' }}>
                    / month{isAnnual && price > 0 ? ' (billed yearly)' : ''}
                  </Text>
                </View>

                <Text className="text-xs text-zinc-400 font-light mb-4 leading-relaxed border-b border-zinc-800/60 pb-4" style={{ fontFamily: 'Inter_400Regular' }}>
                  {plan.description}
                </Text>

                {/* Credits */}
                <View className="flex-row items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 mb-4">
                  <Feather name="zap" size={13} color="#a1a1aa" />
                  <Text className="text-white text-xs font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    {plan.credits}
                  </Text>
                </View>

                {/* Features */}
                <View className="gap-2 mb-5">
                  <Text className="text-[10px] text-zinc-600 uppercase tracking-widest" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    What's included:
                  </Text>
                  {plan.features.map((f, fi) => (
                    <View key={fi} className="flex-row items-start gap-2">
                      <Text className="text-white font-bold text-xs mt-0.5">✓</Text>
                      <Text className="text-zinc-300 text-xs font-light flex-1 leading-snug" style={{ fontFamily: 'Inter_400Regular' }}>
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CTA */}
                <TouchableOpacity
                  onPress={() => handlePlanPress(plan)}
                  activeOpacity={0.8}
                  className={`py-3.5 rounded-2xl items-center ${
                    plan.popular ? 'bg-white' : 'bg-zinc-900 border border-zinc-800'
                  }`}
                  style={plan.popular ? {
                    shadowColor: '#fff',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 4,
                  } : undefined}
                >
                  <Text
                    className={`text-xs font-bold tracking-widest uppercase ${plan.popular ? 'text-black' : 'text-white'}`}
                    style={{ fontFamily: 'Inter_700Bold' }}
                  >
                    {plan.cta}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={() => router.push('/chatbot')}
        onSelectHistoryItem={(txt) => {
          router.push({ pathname: '/chatbot', params: { prompt: txt } });
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
