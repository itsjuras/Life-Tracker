import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-300 dark:text-gray-700 text-base">Home</Text>
      </View>
    </SafeAreaView>
  );
}
