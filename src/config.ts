import 'dotenv/config';

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

const getOptionalEnv = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

export const TELEGRAM_TOKEN = getRequiredEnv('TELEGRAM_TOKEN');
export const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');
export const SUPABASE_KEY = getRequiredEnv('SUPABASE_KEY');

export const WEBHOOK_URL = getRequiredEnv('WEBHOOK_URL');
export const WEBHOOK_PORT = parseInt(process.env.PORT || process.env.WEBHOOK_PORT || '8000', 10);
export const WEBHOOK_PATH = getOptionalEnv('WEBHOOK_PATH', '/webhook');
export const NODE_ENV = getOptionalEnv('NODE_ENV', 'development');
