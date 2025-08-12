//import liraries
import React, { Component, useEffect } from 'react';
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
import { fontFamily } from '../assets/fontFamily';
import { images } from '../assets/images';
import { useNavigation } from '@react-navigation/native';
import { lightTheme, darkTheme } from '../helper/colors';
import { getAuth } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// create a component
const WelcomeScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const checkUser = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          await AsyncStorage.setItem('currentUser', JSON.stringify(user));
          console.log('User stored in AsyncStorage');
          navigation.replace('InitialchatScreen');
        } catch (error) {
          console.error('Error saving user to AsyncStorage:', error);
        }
      } else {
        console.log('User is not logged in.');
      }
    };

    checkUser();
  }, []);

  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const fullText = texts.termspolicy;
  const blueText = 'Privacy Policy';

  // Split the string based on the text you want to color
  const parts = fullText.split(blueText);

  const full_Text = texts.terms_service;
  const blue_Text = 'Teams of Service';

  // Split the string based on the text you want to color
  const parts1 = full_Text.split(blue_Text);

  return (
    <View
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: hp(85),
          flex: 1,
        }}
      >
        <Text
          style={{
            fontSize: fontSize(30),
            fontWeight: 'bold',
            color: themeStyles.texts,
          }}
        >
          {texts.wlc}
        </Text>
        <View
          style={{
            alignItems: 'center',
            width: wp(250),
            height: wp(250),
            borderRadius: wp(153),
            marginTop: hp(38),
          }}
        >
          <Image
            source={colorScheme === 'light' ? images.wlc_img : images.green}
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            marginTop: hp(55),
          }}
        >
          <Text
            style={{
              fontSize: fontSize(13),
              textAlign: 'center',
              color: themeStyles.texts,
            }}
          >
            {parts[0]}
            <Text style={{ color: '#3965d5' }}>{blueText}</Text>
            {parts[1]}
          </Text>
          <Text
            style={{
              fontSize: fontSize(13),
              textAlign: 'center',
              color: themeStyles.texts,
            }}
          >
            {parts1[0]}
            <Text style={{ color: '#3965d5' }}>{blue_Text}</Text>
            {parts1[1]}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            marginTop: hp(24),
            height: hp(39),
            paddingHorizontal: wp(57),
            borderRadius: 4,
            backgroundColor: '#00A884',
            justifyContent: 'center',
          }}
          onPress={() => {
            navigation.navigate('PhoneNumScreen');
          }}
        >
          <Text style={{ color: themeStyles.btn_text }}>{texts.agree}</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: hp(64),
        }}
      >
        <Text style={{ fontSize: fontSize(12), color: themeStyles.texts }}>
          {texts.from}
        </Text>
        <Text style={{ fontSize: fontSize(15), color: themeStyles.texts }}>
          {texts.facebook}
        </Text>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

//make this component available to the app
export default WelcomeScreen;
