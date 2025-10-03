import { useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export function useFCMToken() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        if (Platform.OS === 'ios') {
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (!enabled) {
            Alert.alert(
              'Permission Denied',
              'Enable notifications in Settings.',
            );
            return;
          }
        }

        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('Notification permission denied on Android.');
            return;
          }
        }

        const token = await messaging().getToken();
        setFcmToken(token);

        return messaging().onTokenRefresh(newToken => {
          console.log('FCM Token refreshed:', newToken);
          setFcmToken(newToken);
        });
      } catch (err) {
        console.error('Error fetching FCM token:', err);
      }
    };

    getToken().then(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        return () => unsubscribe();
      }
    });
  }, []);

  return fcmToken;
}
