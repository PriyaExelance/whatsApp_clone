import axios from 'axios';

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  screen: string,
  chatId?: string,
  senderId?: string,
) {
  try {
    const response = await axios.post(
      'http://10.0.2.2:3000/send',
      {
        userId: String(userId || ''),
        title: String(title || ''),
        body: String(body || ''),
        screen: String(screen || 'ChatScreen'),
        chatId: String(chatId || ''),
        senderId: String(senderId || ''),
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
      url: 'http://10.0.2.2:3000/send',
    });
    throw error;
  }
}
