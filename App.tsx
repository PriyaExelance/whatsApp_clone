import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { RootStack } from './src/navigation/RootStack';
import OtpScreen from './src/screens/OtpScreen';
import RNBootSplash from 'react-native-bootsplash';
import { useEffect } from 'react';
import { lightTheme, darkTheme } from './src/helper/colors';
import { ThemeProvider } from './src/hooks/themeContext';

function App() {
  // const colorScheme = useColorScheme();
  // const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  // const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
