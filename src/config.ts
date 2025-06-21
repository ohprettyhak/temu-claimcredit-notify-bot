import 'dotenv/config';

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

export const TELEGRAM_TOKEN = getRequiredEnv('TELEGRAM_TOKEN');
export const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');
export const SUPABASE_KEY = getRequiredEnv('SUPABASE_KEY');
