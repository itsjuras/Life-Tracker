import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Habit, HabitEntry } from '../../models/Habit';

interface Props {
  habit: Habit;
  entry: HabitEntry | undefined;
  onToggle: (habitId: string, completed: boolean) => void;
}

export default function HabitCard({ habit, entry, onToggle }: Props) {
  return (
    <TouchableOpacity onPress={() => onToggle(habit.id, !(entry?.completed ?? false))}>
      <View>
        <Text>{habit.iconKey}</Text>
        <Text>{habit.name}</Text>
        <Text>{entry?.completed ? '✓' : '○'}</Text>
      </View>
    </TouchableOpacity>
  );
}
