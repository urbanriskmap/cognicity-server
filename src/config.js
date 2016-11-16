require('dotenv').config({silent:true})

module.exports = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
  AUTH0_SECRET: process.env.AUTH0_SECRET || '',
  BODY_LIMIT: process.env.BODY_LIMIT || '100kb',
  CACHE: process.env.CACHE === 'true' || false,
  COMPRESSION: process.env.COMPRESSION === 'true' || false,
  CORS: process.env.CORS === 'true' || false,
  CORS_HEADERS: process.env.CORS_HEADERS || ['Link'],
  DB_HOSTNAME: process.env.DB_HOSTNAME || '127.0.0.1',
  DB_PASSWORD: process.env.DB_PASSWORD || 'cognicity',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'cognicity',
  DB_USERNAME: process.env.DB_USERNAME || 'cognicity',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8001,
  RESPONSE_TIME: process.env.RESPONSE_TIME === 'false' || true,
}
