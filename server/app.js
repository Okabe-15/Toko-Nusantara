'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const pgSession = require('connect-pg-simple')(session);
const apiRouter = require('./routers/api');

const app = express();
const port = process.env.PORT || 3002;
const isProduction = process.env.NODE_ENV === 'production';
const secureCookie = process.env.SESSION_COOKIE_SECURE === 'true';
const sameSite = process.env.SESSION_COOKIE_SAMESITE || (isProduction ? 'lax' : 'lax');
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
if (!isProduction) {
  allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}

app.set('trust proxy', 1);
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin tidak diizinkan'));
  },
  credentials: true
}));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(session({
  name: 'toko.sid',
  secret: process.env.SESSION_SECRET || 'toko-nusantara-development-secret',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  store: isProduction || process.env.DATABASE_URL
  ? new pgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true
  })
  : undefined,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    path: '/',
    sameSite,
    secure: secureCookie
  }
}));

app.use('/api', apiRouter);

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/assets')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((req, res) => {
  return res.status(404).json({ error: { message: 'API route tidak ditemukan' } });
});

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Toko Nusantara berjalan di http://localhost:${port}`);
  });
}

module.exports = app;
