import axios from 'axios';

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  screen: string,
) {
  try {
    const response = await axios.post(
      'http://10.0.2.2:3000/send-notification',
      {
        token,
        title,
        body,
        screen,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('Notification request sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending notification:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: 'http://10.0.2.2:3000/send-notification',
    });
    throw error;
  }
}
