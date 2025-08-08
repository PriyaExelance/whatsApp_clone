//import liraries
import React, { Component, use, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { wp, hp, fontSize } from '../helper/responsive';
import { texts } from '../helper/strings';
import { fontFamily } from '../assets/fontFamily';
import { images } from '../assets/images';
import { useNavigation } from '@react-navigation/native';
import { lightTheme, darkTheme } from '../helper/colors';
import Countrypicker from 'react-native-country-picker-modal';
import auth from '@react-native-firebase/auth';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

// create a component
const PhoneNumScreen = () => {
  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const [countryName, setCountryName] = useState('India');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [visible, setVisible] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fullText = texts.wp_num;
  const blue_text = 'What’s my number?';
  const parts = fullText.split(blue_text);

  const navigation = useNavigation();
  const handlePhoneAuth = async () => {
    if (!phone || phone.length < 10) {
      return Alert.alert('Invalid phone number');
    }
    try {
      const confirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
      console.log('Confirmation:', confirmation);
      navigation.navigate('OtpScreen', {
        confirmation: confirmation,
        phone: phone,
      });
    } catch (error) {
      console.log('Raw error object:', JSON.stringify(error, null, 2));
      console.error('Error sending code:', error?.message || error);
      Alert.alert('Error sending code', error?.message || 'Unknown error');
    }
  };
  return (
    <View
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            marginTop: hp(91),
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: fontSize(20),
              textAlign: 'center',
              fontWeight: '500',
              color: themeStyles.texts,
            }}
          >
            {texts.enter_ph}
          </Text>
          <Image
            source={images.settings}
            style={{
              resizeMode: 'contain',
              marginLeft: wp(26),
              tintColor: themeStyles.texts,
            }}
          />
        </View>
        <View style={{ paddingHorizontal: wp(37), marginTop: hp(35) }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: fontSize(13),
              color: themeStyles.texts,
            }}
          >
            {parts[0]}
            <Text style={{ color: '#3965d5' }}>{blue_text}</Text>
            {parts[1]}
          </Text>
        </View>
        <View style={{ marginTop: hp(61) }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={() => setVisible(!visible)}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: hp(10),
                width: wp(230),
                justifyContent: 'space-between',
                borderColor: '#00A884',
                borderBottomWidth: 0.5,
              }}
            >
              <View />
              <Text style={{ color: themeStyles.texts }}>{countryName}</Text>
              <Image
                source={images.dd}
                style={{ tintColor: themeStyles.texts }}
              />
            </View>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                alignItems: 'center',
                borderColor: '#00A884',
                borderBottomWidth: 1,
                width: wp(55),
                marginRight: wp(15),
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: themeStyles.texts }}>{countryCode}</Text>
            </View>
            <View
              style={{
                borderColor: '#00A884',
                borderBottomWidth: 1,
                width: wp(160),
              }}
            >
              <TextInput
                placeholder="Enter phone number"
                value={phone}
                onChangeText={txt => setPhone(txt)}
                keyboardType="number-pad"
                style={{ color: themeStyles.texts }}
              />
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'center', marginTop: hp(7) }}>
          <Text style={{ fontSize: fontSize(11) }}>{texts.carrier}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: hp(56),
            backgroundColor: '#00A884',
            borderRadius: wp(3),
            width: wp(60),
            height: hp(28),
          }}
          onPress={() => handlePhoneAuth()}
        >
          <Text
            style={{
              fontSize: fontSize(12),
              fontWeight: '600',
              color: themeStyles.btn_text,
            }}
          >
            {texts.next}
          </Text>
        </TouchableOpacity>
      </View>
      {visible && (
        <Countrypicker
          visible={true}
          onClose={() => setVisible(false)}
          onSelect={e => {
            setCountryCode(`+${e.callingCode[0]}`);
            setCountryName(e.name);
          }}
        />
      )}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#151E26',
  },
});

//make this component available to the app
export default PhoneNumScreen;
