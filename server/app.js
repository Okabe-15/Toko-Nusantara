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
const clientDist = path.join(__dirname, '..', 'client', 'dist');

app.set('trust proxy', 1);
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(value => value.trim()) : true,
  credentials: true
}));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'toko-nusantara-development-secret',
  resave: false,
  saveUninitialized: false,
  store: isProduction || process.env.DATABASE_URL
  ? new pgSession({ conString: process.env.DATABASE_URL })
  : undefined,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    sameSite: 'lax',
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
