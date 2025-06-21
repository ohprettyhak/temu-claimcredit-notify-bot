import express from 'express';
import { WEBHOOK_URL, WEBHOOK_PORT, WEBHOOK_PATH } from '../config';
import { bot } from '../bot';
import { MESSAGES, ERROR_MESSAGES, DEV_LOGS } from '../constants';

export const app = express();

app.use(express.json());

export const setupWebhook = async (): Promise<void> => {
  try {
    const webhookUrl = `${WEBHOOK_URL}${WEBHOOK_PATH}`;
    await bot.telegram.setWebhook(webhookUrl);
    console.log(DEV_LOGS.WEBHOOK_URL_SET(webhookUrl));
  } catch (error) {
    console.error(ERROR_MESSAGES.WEBHOOK_SETUP_ERROR, error);
    throw error;
  }
};

export const setupRoutes = (): void => {
  app.get('/health', (_, res) => {
    res.json({ status: 'ok', message: MESSAGES.WEBHOOK_HEALTH_CHECK });
  });

  app.post(WEBHOOK_PATH, (req, res) => {
    try {
      console.log(DEV_LOGS.WEBHOOK_REQUEST_RECEIVED(req.method, req.path));
      bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error(ERROR_MESSAGES.WEBHOOK_REQUEST_ERROR, error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.use((_, res) => {
    res.status(404).json({ error: 'Not Found' });
  });
};

export const startServer = (): void => {
  app.listen(WEBHOOK_PORT, () => {
    console.log(DEV_LOGS.WEBHOOK_SERVER_LISTENING(WEBHOOK_PORT));
  });
};
