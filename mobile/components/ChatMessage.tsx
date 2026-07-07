import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface ChatMessageProps {
  message: {
    text: string;
    sender: 'user' | 'ai';
    agentType?: string;
  };
  userName?: string;
  onSpeak?: (text: string) => void;
  onCopy?: (text: string) => void;
  onEdit?: (text: string) => void;
}

const markdownStyles = {
  body: {
    color: '#d4d4d8',
    fontSize: 13.5,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  heading1: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontWeight: '400' as const,
    marginTop: 12,
    marginBottom: 6,
  },
  heading2: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontWeight: '400' as const,
    marginTop: 10,
    marginBottom: 4,
  },
  heading3: {
    color: '#d4d4d8',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    color: '#a1a1aa',
    fontSize: 13.5,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
    lineHeight: 22,
  },
  strong: {
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  em: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontStyle: 'italic' as const,
    color: '#fafafa',
  },
  bullet_list: { marginLeft: 8, marginBottom: 4 },
  ordered_list: { marginLeft: 8, marginBottom: 4 },
  list_item: { color: '#a1a1aa', fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 22 },
  table: { borderWidth: 1, borderColor: '#27272a', borderRadius: 8, marginVertical: 8 },
  th: {
    backgroundColor: '#18181b',
    padding: 10,
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    borderBottomWidth: 1,
    borderColor: '#27272a',
  },
  td: {
    padding: 10,
    color: '#a1a1aa',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    borderBottomWidth: 1,
    borderColor: '#27272a',
  },
  code_block: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#d4d4d8',
  },
  fence: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#d4d4d8',
  },
  link: { color: '#ffffff', textDecorationLine: 'underline' as const },
  hr: { borderColor: '#27272a', marginVertical: 12 },
};

export default function ChatMessage({ message, userName, onSpeak, onCopy, onEdit }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <View className={`flex-row gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <View
        className={`w-8 h-8 rounded-full items-center justify-center border flex-shrink-0 mt-1 ${
          isUser
            ? 'bg-zinc-800 border-zinc-700'
            : 'bg-zinc-900 border-zinc-800'
        }`}
      >
        <Text
          className={`text-white ${isUser ? 'text-xs font-bold' : 'text-base'}`}
          style={{
            fontFamily: isUser ? 'Inter_700Bold' : 'InstrumentSerif_400Regular_Italic',
          }}
        >
          {isUser ? (userName?.[0]?.toUpperCase() ?? 'G') : 'SB'}
        </Text>
      </View>

      {/* Bubble */}
      <View
        className={`flex-1 rounded-3xl px-4 py-3.5 max-w-[85%] ${
          isUser
            ? 'bg-white rounded-tr-sm self-end'
            : 'bg-zinc-950 border border-zinc-800 rounded-tl-sm self-start'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {isUser ? (
          <>
            <Text className="text-black text-sm font-medium leading-relaxed" style={{ fontFamily: 'Inter_500Medium' }}>
              {message.text}
            </Text>
            {/* User message action footer */}
            <View className="flex-row items-center justify-end gap-2 mt-2 pt-2 border-t border-zinc-200/80">
              {onCopy && (
                <TouchableOpacity
                  onPress={() => onCopy(message.text)}
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded bg-zinc-100"
                >
                  <Text className="text-[10px] text-zinc-600 font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>📋 Copy</Text>
                </TouchableOpacity>
              )}
              {onEdit && (
                <TouchableOpacity
                  onPress={() => onEdit(message.text)}
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded bg-zinc-100"
                >
                  <Text className="text-[10px] text-zinc-600 font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>✏️ Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            <Markdown style={markdownStyles}>{message.text}</Markdown>
            {/* Footer */}
            <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-zinc-800">
              {message.agentType ? (
                <Text className="text-[10px] text-zinc-600 uppercase tracking-widest" style={{ fontFamily: 'Inter_400Regular' }}>
                  {message.agentType.replace('_', ' ')}
                </Text>
              ) : <View />}
              
              <View className="flex-row items-center gap-1.5">
                {onCopy && (
                  <TouchableOpacity
                    onPress={() => onCopy(message.text)}
                    className="flex-row items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1"
                  >
                    <Text className="text-zinc-400 text-[11px] uppercase tracking-wider" style={{ fontFamily: 'Inter_400Regular' }}>
                      📋 Copy
                    </Text>
                  </TouchableOpacity>
                )}
                {onSpeak && (
                  <TouchableOpacity
                    onPress={() => onSpeak(message.text)}
                    className="flex-row items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1"
                  >
                    <Text className="text-zinc-400 text-[11px] uppercase tracking-wider" style={{ fontFamily: 'Inter_400Regular' }}>
                      🔊 Listen
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
