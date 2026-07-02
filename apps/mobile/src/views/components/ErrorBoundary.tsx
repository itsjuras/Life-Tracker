import React from 'react';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Catches any render/lifecycle error in the tree below and shows a visible
// fallback instead of a blank screen. Uses plain React Native primitives only
// (no nativewind, no contexts) so it still renders if those are what crashed.
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={{
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 24,
    }}>
      <Text style={{
        fontSize: 11, fontWeight: '600', letterSpacing: 1.5,
        textTransform: 'uppercase', textAlign: 'center',
        color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
      }}>
        Something went wrong.
      </Text>
      <TouchableOpacity onPress={onRetry} activeOpacity={0.6}>
        <Text style={{
          fontSize: 11, fontWeight: '600', letterSpacing: 3,
          textTransform: 'uppercase',
          color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
        }}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
}
