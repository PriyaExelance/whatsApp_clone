//import liraries
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { wp, hp, fontSize } from '../helper/responsive';
import { texts } from '../helper/strings';
import { images } from '../assets/images';
import { useNavigation } from '@react-navigation/native';
import { lightTheme, darkTheme, colors } from '../helper/colors';
import { getAuth } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// create a component
const WelcomeScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    checkUser();
  }, []);
  const checkUser = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));

        navigation.replace('InitialchatScreen');
      } catch (error) {
        console.error('Error saving user to AsyncStorage:', error);
      }
    } else {
      console.log('User is not logged in.');
    }
  };

  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const fullText = texts.termspolicy;
  const blueText = 'Privacy Policy';

  const parts = fullText.split(blueText);

  const full_Text = texts.terms_service;
  const blue_Text = 'Teams of Service';

  const parts1 = full_Text.split(blue_Text);

  return (
    <View
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <View style={styles.wlc_header}>
        <Text style={[styles.wlc_text, { color: themeStyles.texts }]}>
          {texts.wlc}
        </Text>
        <View style={styles.img_view}>
          <Image
            source={colorScheme === 'light' ? images.wlc_img : images.green}
          />
        </View>
        <View style={styles.text_terms}>
          <Text style={[styles.txt_policy, { color: themeStyles.texts }]}>
            {parts[0]}
            <Text style={styles.txt_color}>{blueText}</Text>
            {parts[1]}
          </Text>
          <Text style={[styles.txt_policy, { color: themeStyles.texts }]}>
            {parts1[0]}
            <Text style={styles.txt_color}>{blue_Text}</Text>
            {parts1[1]}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.agree_continue}
          onPress={() => {
            navigation.navigate('PhoneNumScreen');
          }}
        >
          <Text style={{ color: themeStyles.btn_text }}>{texts.agree}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottom_txt}>
        <Text style={[styles.from_txt, { color: themeStyles.texts }]}>
          {texts.from}
        </Text>
        <Text style={[styles.facebook_txt, { color: themeStyles.texts }]}>
          {texts.facebook}
        </Text>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  bottom_txt: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(64),
  },
  facebook_txt: { fontSize: fontSize(15) },
  from_txt: { fontSize: fontSize(12) },
  agree_continue: {
    marginTop: hp(24),
    height: hp(39),
    borderRadius: wp(4),
    backgroundColor: colors.lightGreen,
    justifyContent: 'center',
    paddingHorizontal: wp(57),
  },
  txt_color: { color: colors.blue },
  txt_policy: { fontSize: fontSize(13), textAlign: 'center' },
  text_terms: { marginTop: hp(55) },
  img_view: { marginTop: hp(38) },
  wlc_text: {
    fontSize: fontSize(30),
    fontWeight: 'bold',
  },
  wlc_header: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  container: {
    flex: 1,
  },
});

export default WelcomeScreen;
