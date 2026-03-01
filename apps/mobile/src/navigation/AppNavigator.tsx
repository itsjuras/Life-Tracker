import React, { useState } from 'react';
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
import TrackingManagerScreen from '../views/screens/TrackingManagerScreen';
import Avatar from '../views/components/Avatar';

const Tab = createBottomTabNavigator();

type SettingsPage = 'settings' | 'tracking';

function HomeTab() {
  return <HomeScreen />;
}

function SettingsTab() {
  const { session } = useAuth();
  const [page, setPage] = useState<SettingsPage>('settings');

  if (!session) return <LoginScreen />;
  if (page === 'tracking') return <TrackingManagerScreen onBack={() => setPage('settings')} />;
  return <SettingsScreen onEditTracking={() => setPage('tracking')} />;
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
            position: 'absolute',
            bottom: 28,
            left: 24,
            right: 24,
            borderRadius: 32,
            backgroundColor: isDark ? '#111111' : '#f9fafb',
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.35 : 0.1,
            shadowRadius: 20,
            elevation: 12,
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
          component={HomeTab}
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
