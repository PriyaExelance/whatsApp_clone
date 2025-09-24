//import liraries
import React, { useState, useContext } from 'react';
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

import { images } from '../assets/images';
import { useNavigation } from '@react-navigation/native';
import { lightTheme, darkTheme, colors } from '../helper/colors';
import Countrypicker from 'react-native-country-picker-modal';
import auth from '@react-native-firebase/auth';
import { ThemeContext } from '../helper/themeContext';

// create a component
const PhoneNumScreen = () => {
  const { theme } = useContext(ThemeContext);
  const [countryName, setCountryName] = useState('India');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [visible, setVisible] = useState(false);
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.top_view}>
        <View style={styles.header_view}>
          <Text style={[styles.header_txt, { color: theme.colors.texts }]}>
            {texts.enter_ph}
          </Text>
          <Image
            source={images.settings}
            style={[styles.setting_img, { tintColor: theme.colors.texts }]}
          />
        </View>
        <View style={styles.verify_phone}>
          <Text
            style={[styles.verify_phoneText, { color: theme.colors.texts }]}
          >
            {parts[0]}
            <Text style={styles.parted_textcolor}>{blue_text}</Text>
            {parts[1]}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.country_modal}
          onPress={() => setVisible(!visible)}
        >
          <View style={styles.country_view}>
            <View />
            <Text style={{ color: theme.colors.texts }}>{countryName}</Text>
            <Image
              source={images.dd}
              style={{ tintColor: theme.colors.texts }}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.number_view}>
          <View style={styles.country_codeView}>
            <Text style={{ color: theme.colors.texts }}>{countryCode}</Text>
          </View>
          <View style={styles.phone_view}>
            <TextInput
              placeholder="Enter phone number"
              value={phone}
              onChangeText={txt => setPhone(txt)}
              keyboardType="number-pad"
              style={{ color: theme.colors.texts }}
            />
          </View>
        </View>

        <View style={styles.charges_view}>
          <Text style={styles.carrier_text}>{texts.carrier}</Text>
        </View>
      </View>
      <View style={styles.next_btnView}>
        <TouchableOpacity
          style={styles.next_btn}
          onPress={() => handlePhoneAuth()}
        >
          <Text style={[styles.next_text, { color: theme.colors.btn_text }]}>
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

const styles = StyleSheet.create({
  carrier_text: { fontSize: fontSize(11) },
  next_text: { fontSize: fontSize(12), fontWeight: '600' },
  next_btn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(56),
    backgroundColor: colors.lightGreen,
    borderRadius: wp(3),
    width: wp(60),
    height: hp(28),
  },
  next_btnView: { alignItems: 'center' },
  charges_view: { alignItems: 'center', marginTop: hp(7) },
  phone_view: {
    borderColor: colors.lightGreen,
    borderBottomWidth: 1,
    width: wp(160),
  },
  country_codeView: {
    alignItems: 'center',
    borderColor: colors.lightGreen,
    borderBottomWidth: 1,
    width: wp(55),
    marginRight: wp(15),
    justifyContent: 'center',
  },
  number_view: { flexDirection: 'row', justifyContent: 'center' },
  country_view: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(10),
    width: wp(230),
    borderColor: colors.lightGreen,
    borderBottomWidth: 0.5,
    justifyContent: 'space-between',
  },
  country_modal: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(24),
  },
  parted_textcolor: { color: colors.blue },
  verify_phoneText: { textAlign: 'center', fontSize: fontSize(13) },
  verify_phone: { paddingHorizontal: wp(36), marginTop: hp(35) },
  setting_img: {
    resizeMode: 'contain',
    marginLeft: wp(26),
  },
  header_txt: {
    fontSize: fontSize(20),
    textAlign: 'center',
    fontWeight: '500',
  },
  header_view: {
    marginTop: hp(91),
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  top_view: { flex: 1 },
  container: {
    flex: 1,
  },
  dropdownMenuStyle: {
    backgroundColor: colors.back,
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
    color: colors.dd,
  },
});

export default PhoneNumScreen;
