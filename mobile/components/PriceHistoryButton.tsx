import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getPriceHistoryUrl, getPriceBeforeUrl } from '../utils/priceHistoryLinks';

interface PriceHistoryButtonProps {
  product: any;
}

export default function PriceHistoryButton({ product }: PriceHistoryButtonProps) {
  const handlePriceHistory = () => {
    const url = getPriceHistoryUrl(product);
    Linking.openURL(url).catch(() => {});
  };

  const handlePriceBefore = () => {
    const url = getPriceBeforeUrl(product);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View className="flex-row gap-2 items-center">
      <TouchableOpacity
        onPress={handlePriceHistory}
        activeOpacity={0.75}
        className="flex-1 flex-row items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full py-2.5 px-4"
      >
        <Feather name="trending-up" size={13} color="#a1a1aa" />
        <Text className="text-zinc-300 text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
          Price History
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handlePriceBefore}
        activeOpacity={0.75}
        className="bg-zinc-900 border border-zinc-800 rounded-full py-2.5 px-3 items-center justify-center"
      >
        <Text className="text-zinc-400 text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
          PB ↗
        </Text>
      </TouchableOpacity>
    </View>
  );
}
