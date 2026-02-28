import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';

const MAX_WORDS = 25;

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export default function ReflectionInput({ value, onChange }: Props) {
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;

  return (
    <View>
      <TextInput
        placeholder="What stuck out today?"
        value={value}
        onChangeText={onChange}
        multiline
      />
      <Text>{wordCount} / {MAX_WORDS} words</Text>
    </View>
  );
}
