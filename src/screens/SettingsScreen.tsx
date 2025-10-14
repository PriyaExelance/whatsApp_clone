//import liraries
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { wp, hp, fontSize } from '../helper/responsive';
import { texts } from '../helper/strings';
import { images } from '../assets/images';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../helper/colors';
import { useContext, useState, useEffect } from 'react';
import auth, { getAuth, signOut } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../hooks/themeContext';
// create a component
const SettingsScreen = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const [isEnabled, setEnabled] = useState(false);
  const handleToggle = () => {
    setEnabled(!isEnabled), toggleTheme();
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('darkMode');
        if (saved !== null) {
          setEnabled(saved === 'true');
        }
      } catch (e) {
        console.log('Error loading theme preference', e);
      }
    };
    loadTheme();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem('darkMode', String(isEnabled));
  }, [isEnabled]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      navigation.navigate('WelcomeScreen');
    } catch (error) {
      console.error('Error removing user token:', error);
    }
  };
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.header_color}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack('InitialchatScreen')}
          >
            <Image source={images.back_btn} style={styles.backbtn} />
          </TouchableOpacity>
          <Text style={styles.whtsapp_color}>{texts.settings}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Image source={images.sign_out} style={styles.signout_btn} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.setting_items}>
        <TouchableOpacity style={styles.dark_light_item}>
          <Image source={images.background} style={styles.icon_style} />
          <Text style={[styles.textSize, { color: theme.colors.texts }]}>
            {texts.dark_light}
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.switch_color,
            {
              backgroundColor: isEnabled ? colors.green : colors.gray,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.enable_btn,
              { alignSelf: isEnabled ? 'flex-end' : 'flex-start' },
            ]}
            onPress={handleToggle}
          ></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  enable_btn: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(10),
    backgroundColor: colors.white,
    elevation: 6,
  },
  switch_color: {
    width: wp(40),
    height: wp(20),
    borderRadius: wp(15),
    justifyContent: 'center',
  },
  textSize: { fontSize: fontSize(15) },
  icon_style: {
    width: wp(20),
    height: wp(20),
    tintColor: colors.green,
    marginRight: wp(10),
  },
  dark_light_item: { flexDirection: 'row', flex: 1 },
  setting_items: {
    flexDirection: 'row',
    marginTop: hp(20),
    paddingHorizontal: wp(12),
  },
  signout_btn: { tintColor: colors.white, width: wp(20), height: wp(20) },
  backbtn: { tintColor: colors.white, width: wp(30), height: wp(30) },
  container: {
    flex: 1,
  },
  header_color: {
    backgroundColor: colors.darkgreen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(36),
    marginBottom: hp(10),
    paddingHorizontal: wp(5),
    justifyContent: 'space-between',
  },

  whtsapp_color: {
    fontSize: fontSize(20),
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header_icons: { flexDirection: 'row' },
});

//make this component available to the app
export default SettingsScreen;
