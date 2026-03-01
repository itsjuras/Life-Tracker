import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../views/screens/HomeScreen';
import ProgressScreen from '../views/screens/ProgressScreen';
import LoginScreen from '../views/screens/LoginScreen';
import SettingsScreen from '../views/screens/SettingsScreen';
import Avatar from '../views/components/Avatar';

const Tab = createBottomTabNavigator();

function SettingsTab() {
  const { session } = useAuth();
  return session ? <SettingsScreen /> : <LoginScreen />;
}

export default function AppNavigator() {
  const { profile } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: isDark ? '#111111' : '#ffffff',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#1f2937' : '#f3f4f6',
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: isDark ? '#ffffff' : '#111111',
          tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        }}
      >
        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsTab}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <View
                style={
                  focused
                    ? {
                        borderRadius: size / 2 + 3,
                        borderWidth: 2,
                        borderColor: isDark ? '#ffffff' : '#111111',
                        padding: 1,
                      }
                    : undefined
                }
              >
                <Avatar url={profile?.avatar_url} size={focused ? size - 2 : size} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
