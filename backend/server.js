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
  const { userId, title, body, screen, chatId } = req.body;

  // Validate userId
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).send({ success: false, error: 'Invalid userId' });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const tokens = userDoc.data()?.fcmTokens || [];

    if (!tokens || tokens.length === 0) {
      return res.status(404).send({ success: false, error: 'No token found for this user' });
    }

    const message = {
      notification: { title, body },
      data: {
        screen,
        senderId: userId,
        chatId: chatId || '',
        messageBody: JSON.stringify({ text: body, type: 'text' }),
      },
    };

    // Use send for each token individually
    const responses = await Promise.all(
      tokens.map(async (token) => {
        try {
          return await admin.messaging().send({ ...message, token });
        } catch (error) {
          console.error(`Failed to send to token ${token}:`, error);
          return { success: false, error: error.message };
        }
      })
    );

    const successful = responses.filter(r => r.success).length;
    const failed = responses.filter(r => !r.success).length;

    if (failed > 0) {
      console.error('Failed responses:', responses.filter(r => !r.success));
    }

    res.status(200).send({ success: true, successful, failed });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));