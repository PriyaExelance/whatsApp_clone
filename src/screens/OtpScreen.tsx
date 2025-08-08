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
import { lightTheme, darkTheme } from '../helper/colors';
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
  const timer = '56';
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

    return () => clearInterval(timer); // Cleanup
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
      <View
        style={{
          marginTop: hp(61),
          paddingHorizontal: wp(20),
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack('PhoneNumScreen')}>
          <Image
            source={images.back}
            style={{
              width: wp(20),
              height: wp(20),
              marginRight: wp(12),
              tintColor: themeStyles.texts,
            }}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: fontSize(24),
            fontWeight: '500',
            color: themeStyles.texts,
          }}
        >
          {texts.enter_otp}
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: fontSize(15), color: themeStyles.texts }}>
          {texts.code_send}
          {main}
        </Text>
        <View style={{ paddingVertical: hp(57), paddingHorizontal: wp(30) }}>
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
            <Text style={{ fontSize: fontSize(15), color: themeStyles.texts }}>
              Resend Code
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ fontSize: fontSize(15), color: themeStyles.texts }}>
            {splitted[0]}

            <Text style={{ color: '#3eb89b' }}>{timeLeft}</Text>

            {splitted[1]}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={{
          marginHorizontal: wp(30),
          padding: hp(10),
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: hp(60),
          backgroundColor:
            code.length !== 6
              ? themeStyles.disabled_button
              : themeStyles.verify_button,
          borderRadius: wp(25),
        }}
        onPress={() => {
          confirmCode();
        }}
        disabled={code.length !== 6}
      >
        <Text
          style={{ color: themeStyles.verify_text, fontSize: fontSize(18) }}
        >
          {texts.verify}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activePinCodeContainer: { borderColor: 'black' },
  pinCodeContainer: { width: wp(40), borderColor: 'black' },
  focusStick: { backgroundColor: 'black' },
});
export default OtpScreen;
