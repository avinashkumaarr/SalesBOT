import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Linking, Modal, Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getStoreProductUrl } from '../utils/productUrls';
import PriceHistoryButton from './PriceHistoryButton';

interface CompareModalProps {
  visible: boolean;
  onClose: () => void;
  product: any;
  allProducts: any[];
}

const { width: SCREEN_W } = Dimensions.get('window');
const COL_W = Math.max(160, (SCREEN_W - 48) / 3);

const SPEC_KEYS = ['processor', 'ram', 'storage', 'display', 'battery', 'graphics', 'os'];

export default function CompareModal({ visible, onClose, product, allProducts }: CompareModalProps) {
  const items = [product, ...allProducts.filter((p) => p !== product && p?.title !== product?.title)].slice(0, 3);

  const getPrice = (p: any) =>
    typeof p?.price === 'number'
      ? p.price
      : parseInt(String(p?.price || '').replace(/\D/g, '')) || 45990;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-zinc-950">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-zinc-800">
          <View>
            <Text
              className="text-2xl text-white font-normal"
              style={{ fontFamily: 'InstrumentSerif_400Regular_Italic' }}
            >
              Side-by-Side
            </Text>
            <Text className="text-xs text-zinc-500 mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
              Assessment
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
          >
            <Feather name="x" size={16} color="#71717a" />
          </TouchableOpacity>
        </View>

        {/* Scrollable comparison table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Column headers */}
            <View className="flex-row pt-4 px-4 pb-2 gap-3">
              {/* Row label col */}
              <View style={{ width: 100 }} />
              {items.map((item, idx) => (
                <View
                  key={idx}
                  style={{ width: COL_W }}
                  className={`rounded-2xl p-3 ${idx === 0 ? 'bg-white/10 border border-white/15' : 'bg-zinc-900 border border-zinc-800'}`}
                >
                  <Text className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    {idx === 0 ? 'Selected' : `Alt #${idx}`}
                  </Text>
                  <Text className="text-xs text-white font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }} numberOfLines={3}>
                    {item?.title || 'Product'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Rows */}
            {[
              { label: 'Best Price', render: (item: any) => `₹${getPrice(item).toLocaleString('en-IN')}` },
              { label: 'Match Score', render: (item: any, i: number) => `${(item?.aiScore || (9.8 - i * 0.3).toFixed(1))} / 10` },
              ...SPEC_KEYS.map((k) => ({
                label: k.charAt(0).toUpperCase() + k.slice(1),
                render: (item: any) => {
                  const s = item?.specifications || {};
                  return s[k] || s[k.toLowerCase()] || '—';
                },
              })),
            ].map((row, rIdx) => (
              <View key={rIdx} className="flex-row px-4 py-2 gap-3 border-b border-zinc-800/40 items-start">
                <View style={{ width: 100 }} className="justify-center">
                  <Text className="text-[11px] text-zinc-500 font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                    {row.label}
                  </Text>
                </View>
                {items.map((item, idx) => (
                  <View
                    key={idx}
                    style={{ width: COL_W }}
                    className={`rounded-xl px-2.5 py-2 ${idx === 0 ? 'bg-white/5' : ''}`}
                  >
                    <Text
                      className={`text-xs ${idx === 0 ? 'text-white font-semibold' : 'text-zinc-400 font-light'}`}
                      style={{ fontFamily: idx === 0 ? 'Inter_600SemiBold' : 'Inter_400Regular' }}
                    >
                      {row.render(item, idx)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Action rows */}
            <View className="flex-row px-4 pt-4 pb-8 gap-3 items-start">
              <View style={{ width: 100 }}>
                <Text className="text-[11px] text-zinc-500 font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                  Actions
                </Text>
              </View>
              {items.map((item, idx) => (
                <View key={idx} style={{ width: COL_W }} className="gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      const url = getStoreProductUrl(item, item?.stores?.[0] || 'Amazon India');
                      Linking.openURL(url).catch(() => {});
                    }}
                    activeOpacity={0.8}
                    className="bg-white rounded-full py-2.5 items-center justify-center"
                  >
                    <Text className="text-black text-xs font-bold tracking-wider uppercase" style={{ fontFamily: 'Inter_700Bold' }}>
                      Buy Now
                    </Text>
                  </TouchableOpacity>
                  <PriceHistoryButton product={item} />
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-zinc-800">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            className="bg-zinc-900 border border-zinc-800 rounded-full py-3 items-center"
          >
            <Text className="text-white text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Close Assessment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
