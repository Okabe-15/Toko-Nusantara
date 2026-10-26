'use strict';

const crypto = require('crypto');

const tokenLifetimeSeconds = 60 * 60 * 24;

function getSecret() {
  return process.env.API_TOKEN_SECRET || process.env.SESSION_SECRET || 'toko-nusantara-development-secret';
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function createApiToken(user) {
  const payload = encode({
    sub: user.id,
    role: user.role,
    username: user.username,
    ver: user.apiTokenVersion || 0,
    exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds
  });
  return `${payload}.${sign(payload)}`;
}

function verifyApiToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.sub || !data.role || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return { ...data, ver: Number.isInteger(data.ver) ? data.ver : 0 };
  } catch {
    return null;
  }
}

module.exports = { createApiToken, verifyApiToken };
