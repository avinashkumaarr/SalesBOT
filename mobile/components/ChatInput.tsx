import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
  initialText?: string;
}

export default function ChatInput({ onSend, isLoading, onCancel, initialText }: ChatInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialText) {
      setText(initialText);
      inputRef.current?.focus();
    }
  }, [initialText]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSend(trimmed);
    setText('');
  };

  return (
    <View className="px-4 pb-4 pt-2 bg-zinc-950 border-t border-zinc-900/80">
      {/* Cancel button while loading */}
        {isLoading && onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 mb-3 self-center"
          >
            <Feather name="square" size={13} color="#71717a" />
            <Text className="text-zinc-400 text-xs uppercase tracking-wider" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Stop Generation
            </Text>
          </TouchableOpacity>
        )}

        {/* 1. Top Status Bar (Dark theme, floating look) */}
        <View className="bg-zinc-900 border border-zinc-800 border-b-0 rounded-t-2xl py-2 px-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <Text className="text-zinc-300 text-[11px]" style={{ fontFamily: 'Inter_500Medium' }}>
              60/450 credits
            </Text>
            <View className="bg-white px-1.5 py-0.5 rounded ml-1">
              <Text className="text-black text-[9px] font-bold uppercase" style={{ fontFamily: 'Inter_700Bold' }}>
                Upgrade
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1">
            <Text className="text-zinc-400 text-[11px]" style={{ fontFamily: 'Inter_400Regular' }}>
              Powered by Gemini 2.5 Pro
            </Text>
            <Feather name="zap" size={11} color="#60a5fa" />
          </View>
        </View>

        {/* 2. Main Search Input Card (White theme) */}
        <View className="bg-white rounded-b-3xl rounded-t-lg border border-zinc-200 shadow-xl overflow-hidden">
          {/* Input Textarea Area */}
          <View className="flex-row items-start px-4 pt-3.5 pb-2 min-h-[75px]">
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={(t) => setText(t.slice(0, 3000))}
              placeholder="Ask ShopBot AI anything…"
              placeholderTextColor="#71717a"
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              className="flex-1 text-zinc-900 text-base pr-3"
              style={{
                fontFamily: 'Inter_400Regular',
                color: '#18181b',
                fontSize: 16,
                lineHeight: 22,
                paddingVertical: Platform.OS === 'android' ? 2 : 0,
                textAlignVertical: 'top',
                minHeight: 45,
                maxHeight: 140,
              }}
              editable={!isLoading}
            />

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim() || isLoading}
              activeOpacity={0.8}
              className={`w-11 h-11 rounded-xl items-center justify-center ${
                text.trim() && !isLoading ? 'bg-black' : 'bg-zinc-100'
              }`}
              style={text.trim() && !isLoading ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
              } : undefined}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#71717a" />
              ) : (
                <Feather name="arrow-up" size={18} color={text.trim() ? '#ffffff' : '#d4d4d8'} />
              )}
            </TouchableOpacity>
          </View>

          {/* 3. Bottom Toolbar inside the white card */}
          <View className="border-t border-zinc-100 px-4 py-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert('Attach File', 'File attachment will be supported in the next update.')}
                className="flex-row items-center gap-1 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-200"
              >
                <Text className="text-xs">📎</Text>
                <Text className="text-zinc-600 text-[11px] font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Attach
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert('Voice Search', 'Voice input is available on compatible devices.')}
                className="flex-row items-center gap-1 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-200"
              >
                <Text className="text-xs">🎤</Text>
                <Text className="text-zinc-600 text-[11px] font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Voice
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-[11px] text-zinc-400" style={{ fontFamily: 'Inter_400Regular' }}>
              {text.length}/3000
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
