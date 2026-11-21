import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../theme/colors';
import { tokenStorage } from '../services/tokenStorage';

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => {
    // Load persisted theme
    const loadTheme = async () => {
      try {
        const saved = await tokenStorage.getTheme();
        if (saved !== null) {
          setIsDark(saved === 'dark');
        }
      } catch (e) {
        console.warn('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextMode = !isDark;
    setIsDark(nextMode);
    try {
      await tokenStorage.setTheme(nextMode ? 'dark' : 'light');
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
  };

  const setThemeMode = async (mode) => {
    const isDarkMode = mode === 'dark';
    setIsDark(isDarkMode);
    try {
      await tokenStorage.setTheme(mode);
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

