import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ChatbotRedirectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    router.replace({ pathname: '/', params });
  }, []);

  return <View className="flex-1 bg-zinc-950" />;
}
