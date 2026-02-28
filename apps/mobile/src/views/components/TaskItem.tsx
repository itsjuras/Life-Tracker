import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Task } from '../../models/Task';

interface Props {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
}

export default function TaskItem({ task, onToggle }: Props) {
  return (
    <TouchableOpacity onPress={() => onToggle(task.id, !task.completed)}>
      <Text>{task.completed ? '✓' : '○'} {task.title}</Text>
    </TouchableOpacity>
  );
}
