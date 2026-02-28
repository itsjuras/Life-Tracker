import React from 'react';
import { View, Text } from 'react-native';
import { StatDefinition, StatEntry } from '../../models/Stat';

interface Props {
  stat: StatDefinition;
  entries: StatEntry[];
}

export default function StatChart({ stat, entries }: Props) {
  // TODO: render trend line using victory-native
  return (
    <View>
      <Text>{stat.label} ({stat.unit})</Text>
    </View>
  );
}
