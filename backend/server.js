import express from 'express';
import admin from 'firebase-admin';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

const privateKey = process.env.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.project_id,
    clientEmail: process.env.client_email,
    privateKey,
  }),
});

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Notification server running'));

app.post('/register-token', async (req, res) => {
  const { token, userId } = req.body;
  if (!token || !userId)
    return res.status(400).send({ success: false, error: 'Token or userId missing' });

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const existingTokens = userDoc.data()?.fcmTokens || [];
      if (!existingTokens.includes(token)) existingTokens.push(token);
      await userRef.update({ fcmTokens: existingTokens });
    } else {
      await userRef.set({ fcmTokens: [token] }, { merge: true });
    }

    console.log(`FCM tokens for ${userId}:`, (await userRef.get()).data()?.fcmTokens);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// Send notification to a specific user
app.post('/send', async (req, res) => {
  const { userId, title, body, screen, chatId, senderId } = req.body;

  console.log('Received request body:', req.body); // Debug log

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).send({ success: false, error: 'Invalid userId' });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    console.log('Firestore document data:', userDoc.data()); // Debug log
    const tokens = userDoc.data()?.fcmTokens || [];

    if (!tokens || tokens.length === 0) {
      return res.status(404).send({ success: false, error: 'No token found for this user' });
    }
    console.log('Sending to Tokens:', tokens);

    const message = {
      notification: { title: String(title || ''), body: String(body || '') },
      data: {
        screen: String(screen || 'ChatScreen'),
        id: String(senderId || ''),
        chatId: String(chatId || ''),
        messageBody: JSON.stringify({ text: String(body || ''), type: 'text' }),
      },
    };
    console.log('Constructed message data:', message.data); // Debug log

    const responses = await Promise.all(
      tokens.map(async (token) => {
        try {
          return await admin.messaging().send({ ...message, token });
        } catch (error) {
          console.error(`Failed to send to token ${token}:`, error.message);
          return { success: false, error: error.message };
        }
      })
    );

    const successful = responses.filter(r => typeof r === 'string').length;
    const failed = responses.filter(r => typeof r === 'object' && !r.success).length;

    if (failed > 0) {
      console.error('Failed responses:', responses.filter(r => typeof r === 'object' && !r.success));
    }

    res.status(200).send({ success: true, successful, failed, res: responses });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});
app.listen(3000, () => console.log('Server started on http://localhost:3000'));