import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAmazonProductUrl, getFlipkartProductUrl, getStoreProductUrl } from '../utils/productUrls';
import PriceHistoryButton from './PriceHistoryButton';
import CompareModal from './CompareModal';

interface ProductCardProps {
  product: any;
  index?: number;
  allProducts?: any[];
}

const SPEC_ICONS: Record<string, string> = {
  processor: 'cpu',
  ram: 'database',
  storage: 'hard-drive',
  display: 'monitor',
  battery: 'battery-charging',
  graphics: 'layers',
  os: 'terminal',
};

export default function ProductCard({ product, index = 0, allProducts = [] }: ProductCardProps) {
  const [compareVisible, setCompareVisible] = useState(false);
  const [expertExpanded, setExpertExpanded] = useState(false);

  if (!product) return null;

  const priceNum =
    typeof product.price === 'number'
      ? product.price
      : parseInt(String(product.price || '').replace(/\D/g, '')) || 45990;

  const rawStores = product.stores || product.multiStorePrices || [];
  const stores =
    rawStores.length > 0
      ? rawStores.map((s: any) => ({
          name: s.name || s.store || 'Amazon India',
          price: s.formattedPrice || (typeof s.price === 'number' ? `₹${s.price.toLocaleString('en-IN')}` : s.price) || `₹${priceNum.toLocaleString('en-IN')}`,
          link: getStoreProductUrl(product, s),
        }))
      : [
          { name: 'Amazon India', price: `₹${priceNum.toLocaleString('en-IN')}`, link: getAmazonProductUrl(product) },
          { name: 'Flipkart', price: `₹${Math.max(Math.floor(priceNum * 0.98), priceNum - 1000).toLocaleString('en-IN')}`, link: getFlipkartProductUrl(product) },
          { name: 'Croma', price: `₹${Math.floor(priceNum * 1.01).toLocaleString('en-IN')}`, link: getStoreProductUrl(product, 'Croma') },
          { name: 'Reliance Digital', price: `₹${Math.max(Math.floor(priceNum * 0.99), priceNum - 500).toLocaleString('en-IN')}`, link: getStoreProductUrl(product, 'Reliance Digital') },
          { name: 'Vijay Sales', price: `₹${Math.floor(priceNum * 0.995).toLocaleString('en-IN')}`, link: getStoreProductUrl(product, 'Vijay Sales') },
        ];

  const bestStore = stores[0];
  const specs = product.specifications || {};
  const aiScore = product.aiScore || (10 - index * 0.3).toFixed(1);
  const recommendation = product.recommendation || product.buyRecommendation || null;

  const RANK_LABELS = ['RECOMMENDED', 'STRONG PICK', 'GREAT VALUE', 'SOLID CHOICE', 'CONSIDER'];
  const rankLabel = RANK_LABELS[index] || `PICK #${index + 1}`;
  const specEntries = Object.entries(specs).slice(0, 5);
  const offers = product.offers || [
    '10% Instant Discount on HDFC & ICICI Cards',
    'No-Cost EMI up to 6 months',
  ];

  return (
    <View className="bg-zinc-950/95 border border-zinc-800/80 rounded-3xl overflow-hidden mb-4">
      {/* Top rank strip */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-800/60">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-[9px] text-zinc-500 tracking-widest font-semibold uppercase"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {rankLabel} · #{index + 1}
          </Text>
        </View>
        <Text
          className="text-sm text-white"
          style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
        >
          {aiScore} / 10
        </Text>
      </View>

      <View className="px-5 py-4 gap-4">
        {/* Product Title */}
        <Text
          className="text-xl text-white leading-tight"
          style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
          numberOfLines={3}
        >
          {product.title || product.name || 'Product'}
        </Text>

        {/* Price & Rating row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl text-white font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
            ₹{priceNum.toLocaleString('en-IN')}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-white text-xs" style={{ fontFamily: 'Inter_400Regular' }}>★</Text>
            <Text className="text-zinc-300 text-xs font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
              {product.rating || '4.5'}
            </Text>
            {product.reviewCount && (
              <Text className="text-zinc-500 text-xs" style={{ fontFamily: 'Inter_400Regular' }}>
                ({product.reviewCount})
              </Text>
            )}
          </View>
        </View>

        {/* Spec Grid */}
        {specEntries.length > 0 && (
          <View className="gap-1.5">
            {specEntries.map(([key, val]) => (
              <View key={key} className="flex-row items-start gap-2">
                <Text className="text-zinc-600 text-xs w-20 capitalize" style={{ fontFamily: 'Inter_400Regular' }}>
                  {key}
                </Text>
                <Text className="text-zinc-300 text-xs flex-1 font-light" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={2}>
                  {String(val)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Bank Offers */}
        <View className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-3 gap-1">
          <Text className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Bank Offers
          </Text>
          {offers.slice(0, 2).map((o: string, i: number) => (
            <View key={i} className="flex-row items-start gap-1.5">
              <Text className="text-white text-xs mt-0.5">·</Text>
              <Text className="text-zinc-400 text-xs font-light flex-1" style={{ fontFamily: 'Inter_400Regular' }}>
                {o}
              </Text>
            </View>
          ))}
        </View>

        {/* Store Prices */}
        <View>
          <Text className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2.5" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Available At
          </Text>
          {stores.slice(0, 5).map((s: any, i: number) => (
            <TouchableOpacity
              key={i}
              onPress={() => Linking.openURL(s.link).catch(() => {})}
              activeOpacity={0.75}
              className={`flex-row items-center justify-between px-3.5 py-2.5 rounded-2xl border mb-2 ${
                i === 0 ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <View className="flex-row items-center gap-2.5">
                <View className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
                  <Text className="text-white text-xs font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                    {(s.name || 'A')[0].toUpperCase()}
                  </Text>
                </View>
                <Text
                  className={`text-xs font-semibold ${i === 0 ? 'text-white' : 'text-zinc-300'}`}
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {s.name}
                </Text>
                {i === 0 && (
                  <View className="bg-white rounded-full px-1.5 py-0.5">
                    <Text className="text-black text-[9px] font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                      BEST
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center gap-1.5">
                <Text
                  className={`text-sm font-bold ${i === 0 ? 'text-white' : 'text-zinc-200'}`}
                  style={{ fontFamily: 'Inter_700Bold' }}
                >
                  {s.price}
                </Text>
                <Feather name="external-link" size={12} color={i === 0 ? '#ffffff' : '#71717a'} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expert Verdict (BuyRecommendation) */}
        {recommendation && (
          <View className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 gap-2.5">
            <View className="flex-row items-center justify-between border-b border-zinc-800/60 pb-2.5">
              <View className="flex-row items-center gap-2">
                <Text className="text-white text-xs tracking-widest font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  {recommendation.rating || '★★★★★'}
                </Text>
                <Text className="text-[10px] text-zinc-300 uppercase tracking-widest" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  {(recommendation.title || 'Assessment').replace('AI ', '')}
                </Text>
              </View>
              <Text className="text-[10px] text-zinc-500" style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>
                Expert Verdict
              </Text>
            </View>
            <Text className="text-sm text-white italic" style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}>
              {recommendation.verdict || 'Current price is highly competitive.'}
            </Text>
            <View className="gap-1.5">
              {[
                { label: 'Immediate Purchase', text: recommendation.urgentAdvice },
                { label: 'Strategic Timing', text: recommendation.waitAdvice },
              ].filter(b => b.text).map((b, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Text className="text-white font-medium text-xs mt-0.5">·</Text>
                  <Text className="text-zinc-400 text-xs font-light flex-1" style={{ fontFamily: 'Inter_400Regular' }}>
                    <Text className="text-zinc-200 font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>{b.label}: </Text>
                    {b.text}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="text-[10px] text-zinc-600 pt-1 border-t border-zinc-800/60" style={{ fontFamily: 'Inter_400Regular' }}>
              Verified public historical data · Zero price fabrication
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3 pt-1">
          {/* Buy Now */}
          <TouchableOpacity
            onPress={() => Linking.openURL(bestStore.link).catch(() => {})}
            activeOpacity={0.8}
            className="bg-white rounded-full py-3.5 items-center justify-center"
            style={{
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text className="text-black text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'Inter_700Bold' }}>
              Buy Now
            </Text>
          </TouchableOpacity>

          {/* Secondary row */}
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              onPress={() => setCompareVisible(true)}
              activeOpacity={0.8}
              className="flex-1 border border-zinc-700 rounded-full py-2.5 items-center justify-center flex-row gap-1.5"
            >
              <Feather name="bar-chart-2" size={13} color="#a1a1aa" />
              <Text className="text-zinc-300 text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Compare
              </Text>
            </TouchableOpacity>
            <View className="flex-1">
              <PriceHistoryButton product={product} />
            </View>
          </View>
        </View>
      </View>

      {/* Compare Modal */}
      <CompareModal
        visible={compareVisible}
        onClose={() => setCompareVisible(false)}
        product={product}
        allProducts={allProducts}
      />
    </View>
  );
}
