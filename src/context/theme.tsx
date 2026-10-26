import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Mode = 'terang' | 'gelap' | 'sistem';

// Kalau src/constants/theme.ts sudah punya palet warna, boleh dipakai di sini.
const terang = {
  bg: '#F5F7FA', card: '#FFFFFF', text: '#1B1F23',
  muted: '#6B7280', border: '#E5E7EB',
  primary: '#0A7EA4', danger: '#DC2626',
};
const gelap = {
  bg: '#0F1419', card: '#1A2027', text: '#ECEDEE',
  muted: '#9BA1A6', border: '#2A323B',
  primary: '#4FC3F7', danger: '#F87171',
};

export type Warna = typeof terang;
type Ctx = { mode: Mode; setMode: (m: Mode) => void; colors: Warna; isDark: boolean };

const ThemeCtx = createContext<Ctx>({
  mode: 'sistem', setMode: () => {}, colors: terang, isDark: false,
});
const KEY = 'mode_tema';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const sistem = useColorScheme();
  const [mode, setModeState] = useState<Mode>('sistem');

  // baca pilihan terakhir saat aplikasi dibuka
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => {
        if (v === 'terang' || v === 'gelap' || v === 'sistem') setModeState(v);
      })
      .catch(() => {});
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  };

  const isDark = mode === 'sistem' ? sistem === 'dark' : mode === 'gelap';

  return (
    <ThemeCtx.Provider value={{ mode, setMode, colors: isDark ? gelap : terang, isDark }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);