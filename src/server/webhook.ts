import express from 'express';
import { WEBHOOK_URL, WEBHOOK_PORT, WEBHOOK_PATH } from '../config';
import { bot } from '../bot';
import { MESSAGES, ERROR_MESSAGES, DEV_LOGS } from '../constants';

export const app = express();

app.use(express.json());

const logTelegramUpdate = (update: any): void => {
  try {
    const updateId = update.update_id;

    if (update.message) {
      const message = update.message;
      const user = message.from;
      const chat = message.chat;
      const text = message.text || '[비텍스트 메시지]';

      if (user && chat) {
        const userId = user.id;
        const username = user.username || 'unknown';
        const firstName = user.first_name || 'Unknown';
        const chatId = chat.id;

        if (text.startsWith('/')) {
          console.log(DEV_LOGS.WEBHOOK_COMMAND_RECEIVED(userId, username, firstName, chatId, text));
        } else {
          console.log(DEV_LOGS.WEBHOOK_MESSAGE_RECEIVED(userId, username, firstName, chatId, text));
        }
      }
    } else if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const user = callbackQuery.from;
      const message = callbackQuery.message;
      const data = callbackQuery.data || '[데이터 없음]';

      if (user && message) {
        const userId = user.id;
        const username = user.username || 'unknown';
        const firstName = user.first_name || 'Unknown';
        const chatId = message.chat.id;

        console.log(DEV_LOGS.WEBHOOK_CALLBACK_RECEIVED(userId, username, firstName, chatId, data));
      }
    } else if (update.edited_message) {
      const editedMessage = update.edited_message;
      const user = editedMessage.from;
      const chat = editedMessage.chat;

      if (user && chat) {
        const userId = user.id;
        const chatId = chat.id;
        console.log(DEV_LOGS.WEBHOOK_UPDATE_RECEIVED('편집된 메시지', userId, chatId));
      }
    } else if (update.channel_post) {
      const channelPost = update.channel_post;
      const chat = channelPost.chat;

      if (chat) {
        console.log(DEV_LOGS.WEBHOOK_UPDATE_RECEIVED('채널 포스트', 0, chat.id));
      }
    } else if (update.edited_channel_post) {
      const editedChannelPost = update.edited_channel_post;
      const chat = editedChannelPost.chat;

      if (chat) {
        console.log(DEV_LOGS.WEBHOOK_UPDATE_RECEIVED('편집된 채널 포스트', 0, chat.id));
      }
    } else {
      console.log(DEV_LOGS.WEBHOOK_UNKNOWN_UPDATE(updateId));
    }
  } catch (error) {
    console.error('웹훅 업데이트 로깅 중 오류:', error);
  }
};

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
      logTelegramUpdate(req.body);
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
