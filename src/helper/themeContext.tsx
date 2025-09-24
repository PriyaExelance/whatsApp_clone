// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme === 'dark') {
          setTheme(darkTheme);
        } else if (savedTheme === 'light') {
          setTheme(lightTheme);
        } else {
          const systemColorScheme = Appearance.getColorScheme();
          setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!AsyncStorage.getItem('appTheme')) {
        setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
      }
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    await AsyncStorage.setItem(
      'appTheme',
      newTheme === darkTheme ? 'dark' : 'light',
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
