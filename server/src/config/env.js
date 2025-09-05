import dotenv from 'dotenv';

let isLoaded = false;

export const loadEnv = () => {
  if (!isLoaded) {
    dotenv.config();
    isLoaded = true;
  }
};

export const getEnv = (key, defaultValue = undefined) => {
  loadEnv();
  const value = process.env[key];
  return value === undefined ? defaultValue : value;
};

export const requiredEnv = (key) => {
  const value = getEnv(key);
  if (!value) throw new Error(`Environment variable "${key}" is not set.`);
  return value;
};
