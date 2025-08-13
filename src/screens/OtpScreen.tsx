import React, { Component, useState, useEffect } from 'react';
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
import { OtpInput } from 'react-native-otp-entry';
import { lightTheme, darkTheme, colors } from '../helper/colors';
import { useRoute } from '@react-navigation/native';

const OtpScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const route = useRoute();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const resendCode = texts.resend_code;
  const timer = '60';
  const splitted = resendCode.split(timer);
  const { confirmation, phone } = route.params;
  const firstTwoDigits = phone.substring(0, 2);
  const lastTwoDigits = phone.substring(phone.length - 2);
  const main = `+91 ${firstTwoDigits}******${lastTwoDigits}`;

  useEffect(() => {
    let timers;
    if (timeLeft > 0) {
      timers = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  const confirmCode = async () => {
    try {
      await confirmation.confirm(code);
      navigation.navigate('InitialchatScreen');
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <View style={styles.otp_header}>
        <TouchableOpacity onPress={() => navigation.goBack('PhoneNumScreen')}>
          <Image
            source={images.back}
            style={[styles.back_btn, { tintColor: themeStyles.texts }]}
          />
        </TouchableOpacity>
        <Text style={[styles.header, { color: themeStyles.texts }]}>
          {texts.enter_otp}
        </Text>
      </View>

      <View style={styles.otp_entryHeader}>
        <Text style={[styles.code_send, { color: themeStyles.texts }]}>
          {texts.code_send}
          {main}
        </Text>
        <View style={styles.otp_entry_view}>
          <OtpInput
            numberOfDigits={6}
            onTextChange={setCode}
            type="numeric"
            theme={{
              pinCodeTextStyle: {
                color: themeStyles.texts,
              },
              pinCodeContainerStyle: {
                width: wp(40),
                borderColor: themeStyles.texts,
              },
              focusStickStyle: { backgroundColor: themeStyles.texts },
              focusedPinCodeContainerStyle: { borderColor: themeStyles.texts },
            }}
          />
        </View>

        {canResend ? (
          <TouchableOpacity
            onPress={() => {
              setTimeLeft(60), setCanResend(false);
            }}
          >
            <Text style={[styles.code_send, { color: themeStyles.texts }]}>
              {texts.ResendCode}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.code_send, { color: themeStyles.texts }]}>
            {splitted[0]}
            <Text style={styles.timeLeft}>{timeLeft}</Text>
            {splitted[1]}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.otp_textinput,
          {
            backgroundColor:
              code.length !== 6
                ? themeStyles.disabled_button
                : themeStyles.verify_button,
          },
        ]}
        onPress={() => {
          confirmCode();
        }}
        disabled={code.length !== 6}
      >
        <Text style={[styles.verify_btn, { color: themeStyles.verify_text }]}>
          {texts.verify}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  verify_btn: { fontSize: fontSize(18) },
  otp_textinput: {
    marginHorizontal: wp(30),
    padding: hp(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(60),
    borderRadius: wp(25),
  },
  timeLeft: { color: colors.green },
  otp_entry_view: { paddingVertical: hp(57), paddingHorizontal: wp(30) },
  code_send: { fontSize: fontSize(15) },
  otp_entryHeader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: fontSize(24), fontWeight: '500' },
  back_btn: { width: wp(20), height: wp(20), marginRight: wp(12) },
  otp_header: {
    marginTop: hp(61),
    paddingHorizontal: wp(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
});
export default OtpScreen;
