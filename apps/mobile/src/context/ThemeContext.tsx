import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

const DEFAULT_ACCENT = '#22c55e';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  accentColor: DEFAULT_ACCENT,
  setAccentColor: () => {},
});

const THEME_KEY = '@theme';
const ACCENT_KEY = '@accent_color';

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [accentColor, setAccentColorState] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, ACCENT_KEY]).then(([[, theme], [, accent]]) => {
      if (theme === 'dark' || theme === 'light') setColorScheme(theme);
      if (accent) setAccentColorState(accent);
    });
  }, []);

  async function toggleTheme() {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  }

  async function setAccentColor(color: string) {
    setAccentColorState(color);
    await AsyncStorage.setItem(ACCENT_KEY, color);
  }

  return (
    <ThemeContext.Provider value={{ isDark: colorScheme === 'dark', toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
