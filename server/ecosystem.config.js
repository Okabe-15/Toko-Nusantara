require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
  apps: [
    {
      name: 'toko-nusantara',
      script: 'app.js',
      cwd: __dirname,

      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,

      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3002,
        SESSION_SECRET: process.env.SESSION_SECRET,
        SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE || 'true',
        SESSION_COOKIE_SAMESITE: process.env.SESSION_COOKIE_SAMESITE || 'lax',
        SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
        FRONTEND_URL: process.env.FRONTEND_URL,
        DATABASE_URL: process.env.DATABASE_URL
      }
    }
  ]
};