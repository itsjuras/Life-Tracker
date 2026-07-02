import './global.css';
import React from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/views/components/ErrorBoundary';
import { isSupabaseConfigured } from './src/services/supabase';

// Shown only if the app was built without Supabase credentials (misconfigured
// EAS env vars). Never appears in a correctly built binary — it exists so a
// bad build fails loudly instead of as a blank white screen.
function ConfigErrorScreen() {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={{
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    }}>
      <Text style={{
        fontSize: 11, fontWeight: '600', letterSpacing: 1.5,
        textTransform: 'uppercase', textAlign: 'center',
        color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
      }}>
        This build is misconfigured. Please update the app or contact support.
      </Text>
    </View>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigErrorScreen />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
