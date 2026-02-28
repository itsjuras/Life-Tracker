import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HabitsScreen from '../views/screens/HabitsScreen';
import TasksScreen from '../views/screens/TasksScreen';
import StatsScreen from '../views/screens/StatsScreen';
import ReflectionScreen from '../views/screens/ReflectionScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Habits" component={HabitsScreen} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Reflection" component={ReflectionScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
