import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { RootStack } from './src/navigation/RootStack';
import RNBootSplash from 'react-native-bootsplash';
import { lightTheme, darkTheme } from './src/helper/colors';
import { ThemeProvider } from './src/hooks/themeContext';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}

export default App;
