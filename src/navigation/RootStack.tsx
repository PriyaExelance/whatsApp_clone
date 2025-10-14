import React, { useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import {
  NavigationContainer,
  InitialState,
  LinkingOptions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import WelcomeScreen from '../screens/WelcomeScreen';
import PhoneNumScreen from '../screens/PhoneNumScreen';
import OtpScreen from '../screens/OtpScreen';
import InitialchatScreen from '../screens/InitialchatScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export function RootStack() {
  const [initialState, setInitialState] = useState<InitialState | undefined>();
  const navigationRef = useRef<any>(null);

  const linking: LinkingOptions = {
    prefixes: ['https://new_whatsappclone.web.app', 'mychat://'],
    config: {
      screens: {
        ChatScreen: 'chat/:id',
        InitialchatScreen: 'initial',
        WelcomeScreen: 'welcome',
        StatusScreen: { path: 'status/:id?', parse: { id: String } },
      },
    },
  };

  const handleDeepLink = async (url?: string) => {
    const currentUser = auth().currentUser;
    if (!url || !currentUser) return;

    const currentUserId = currentUser.uid;
    console.log('Deep link received:', url, 'Current user:', currentUserId);

    const CHAT_REGEX = /^mychat:\/\/chat\/([a-zA-Z0-9]{28})$/i;
    const STATUS_REGEX = /^mychat:\/\/status\/([a-zA-Z0-9]{28})$/i;

    // === Chat Deep Link with user ID ===
    if (CHAT_REGEX.test(url) || url.includes('/chat/')) {
      const otherUserId = CHAT_REGEX.test(url)
        ? url.match(CHAT_REGEX)![1]
        : url.split('/chat/')[1];

      if (otherUserId && otherUserId !== 'chat') {
        // Navigate to specific user chat
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(otherUserId)
            .get();

          if (userDoc.exists) {
            navigationRef.current?.reset({
              index: 1,
              routes: [
                { name: 'InitialchatScreen' },
                {
                  name: 'ChatScreen',
                  params: { id: otherUserId, currentUserId },
                },
              ],
            });
          } else {
            navigationRef.current?.reset({
              index: 0,
              routes: [{ name: 'InitialchatScreen' }],
            });
          }
        } catch (err) {
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'InitialchatScreen' }],
          });
        }
        return;
      }

      // Generic /chat link → open chat tab
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'InitialchatScreen', params: { selectedItem: 1 } }],
      });
      return;
    }

    // === Status Deep Link with optional user ID ===
    if (url.includes('/status')) {
      const parts = url.split('/status/');
      const statusUserId = parts[1]; // undefined if only 'status'

      if (statusUserId) {
        // Open status tab with specific user
        navigationRef.current?.reset({
          index: 0,
          routes: [
            {
              name: 'InitialchatScreen',
              params: { selectedItem: 2, openStatusUserId: statusUserId },
            },
          ],
        });
      } else {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'InitialchatScreen', params: { selectedItem: 2 } }],
        });
      }
      return;
    }

    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: 'InitialchatScreen', params: { selectedItem: 1 } }],
    });
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        (async () => {
          const url = await Linking.getInitialURL();
          if (url) {
            if (url === 'mychat://status') {
              setInitialState({
                index: 0,
                routes: [
                  { name: 'InitialchatScreen', params: { selectedItem: 2 } },
                ],
              });
            } else {
              await handleDeepLink(url);
            }
          } else {
            setInitialState({
              index: 0,
              routes: [
                { name: 'InitialchatScreen', params: { selectedItem: 1 } },
              ],
            });
          }
        })();
      } else {
        setInitialState({ index: 0, routes: [{ name: 'WelcomeScreen' }] });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const listener = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage.data);
    });

    const handleNotification = async () => {
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification?.data?.url) {
        handleDeepLink(initialNotification.data.url);
      }

      const unsubscribeOpened = messaging().onNotificationOpenedApp(
        remoteMessage => {
          if (remoteMessage?.data?.url) {
            handleDeepLink(remoteMessage.data.url);
          }
        },
      );

      return unsubscribeOpened;
    };

    handleNotification();

    return () => unsubscribeForeground();
  }, []);

  return (
    <NavigationContainer
      initialState={initialState}
      ref={navigationRef}
      linking={linking}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="PhoneNumScreen" component={PhoneNumScreen} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen name="InitialchatScreen" component={InitialchatScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
