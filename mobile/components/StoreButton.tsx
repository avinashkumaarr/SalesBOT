import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface StoreButtonProps {
  storeName: string;
  price: string;
  url: string;
  isLowest?: boolean;
}

const STORE_ICONS: Record<string, string> = {
  'amazon india': 'A',
  'amazon': 'A',
  'flipkart': 'F',
  'croma': 'C',
  'reliance digital': 'R',
  'vijay sales': 'V',
  'tata cliq': 'T',
};

export default function StoreButton({ storeName, price, url, isLowest }: StoreButtonProps) {
  const icon = STORE_ICONS[storeName.toLowerCase()] ?? storeName[0]?.toUpperCase() ?? 'S';

  const handlePress = () => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      className={`flex-row items-center justify-between px-3.5 py-2.5 rounded-2xl border ${
        isLowest
          ? 'bg-zinc-800 border-zinc-700'
          : 'bg-zinc-900 border-zinc-800'
      } mb-2`}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
          <Text className="text-white text-xs font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
            {icon}
          </Text>
        </View>
        <Text
          className={`text-xs font-semibold ${isLowest ? 'text-white' : 'text-zinc-300'}`}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {storeName}
        </Text>
        {isLowest && (
          <View className="bg-white rounded-full px-1.5 py-0.5">
            <Text className="text-black text-[9px] font-bold tracking-wider" style={{ fontFamily: 'Inter_700Bold' }}>
              BEST
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center gap-1.5">
        <Text className={`text-sm font-bold ${isLowest ? 'text-white' : 'text-zinc-200'}`} style={{ fontFamily: 'Inter_700Bold' }}>
          {price}
        </Text>
        <Feather name="external-link" size={12} color={isLowest ? '#ffffff' : '#71717a'} />
      </View>
    </TouchableOpacity>
  );
}
