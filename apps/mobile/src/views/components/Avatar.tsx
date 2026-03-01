import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  url?: string | null;
  size?: number;
}

export default function Avatar({ url, size = 40 }: AvatarProps) {
  const radius = size / 2;

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="person" size={size * 0.48} color="#9ca3af" />
    </View>
  );
}
