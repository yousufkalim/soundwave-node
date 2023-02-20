import { config as envConfig } from 'dotenv';
envConfig({ path: '.env' });

export const APP_NAME = process.env.APP_NAME ?? 'NodeJS TypeScript Boilerplate';
export const NODE_ENV = process.env.NODE_ENV ?? 'dev';
export const PORT = process.env.PORT ?? 5000;
export const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/nodejs-boilerplate';
export const MAILER_DOMAIN = process.env.MAILER_DOMAIN ?? 'Project-Name';
export const MAILER_EMAIL = process.env.MAILER_EMAIL ?? 'abc@xyz.com';
export const MAILER_PASSWORD = process.env.MAILER_PASSWORD ?? 'password';
export const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT ?? '10');
export const COOKIE_SECRET = process.env.COOKIE_SECRET ?? 'secret';
export const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';
export const HOST = process.env.HOST ?? 'http://localhost:5000';
export const ORIGIN = process.env.ORIGIN ?? 'http://localhost:3000';
export const SPOTIFY_CLIENT_ID =
  process.env.SPOTIFY_CLIENT_ID ?? '6267c52b15a84193903ed412d5305372';
export const SPOTIFY_CLIENT_SECRET =
  process.env.SPOTIFY_CLIENT_SECRET ?? '40177a3141564d0a94c08ec917fac587';
export const SPOTIFY_GET_TOKEN_URL =
  process.env.SPOTIFY_GET_TOKEN_URL ?? 'https://accounts.spotify.com/api/token';
export const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP ?? '';
export const SHOPIFY_ADMIN_ACCESS_TOKEN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN_TOKEN ?? '';
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '';
