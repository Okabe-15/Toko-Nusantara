'use strict';

const { verifyApiToken } = require('../helpers/apiToken');
const { User } = require('../models');

// Memastikan pengguna sudah login sebelum membuka halaman terbatas
function wajibLogin(req, res, next) {
  if (!req.session.userId) {
    const pesan = 'Silakan login terlebih dahulu untuk melanjutkan';
    return res.redirect(`/login?error=${encodeURIComponent(pesan)}`);
  }
  next();
}

// Membatasi halaman tertentu hanya untuk penjual
function wajibPenjual(req, res, next) {
  if (req.session.role !== 'seller') {
    const pesan = 'Halaman ini hanya dapat diakses oleh akun penjual';
    return res.redirect(`/products?error=${encodeURIComponent(pesan)}`);
  }
  next();
}

// Membatasi halaman tertentu hanya untuk pembeli
function wajibPembeli(req, res, next) {
  if (req.session.role !== 'buyer') {
    const pesan = 'Halaman ini hanya dapat diakses oleh akun pembeli';
    return res.redirect(`/products?error=${encodeURIComponent(pesan)}`);
  }
  next();
}

async function apiLogin(req, res, next) {
  try {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const identity = verifyApiToken(token);
    if (!identity) {
      return res.status(401).json({ error: { message: 'Silakan login terlebih dahulu untuk melanjutkan' } });
    }

    const user = await User.findByPk(identity.sub, {
      attributes: ['id', 'username', 'role', 'apiTokenVersion']
    });
    if (!user || user.apiTokenVersion !== identity.ver || user.role !== identity.role) {
      return res.status(401).json({ error: { message: 'Sesi login sudah tidak berlaku' } });
    }

    req.auth = { userId: user.id, username: user.username, role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
}

function apiSeller(req, res, next) {
  if (req.auth?.role !== 'seller') {
    return res.status(403).json({ error: { message: 'Operasi ini hanya dapat dilakukan oleh penjual' } });
  }
  next();
}

function apiBuyer(req, res, next) {
  if (req.auth?.role !== 'buyer') {
    return res.status(403).json({ error: { message: 'Operasi ini hanya dapat dilakukan oleh pembeli' } });
  }
  next();
}

module.exports = { wajibLogin, wajibPenjual, wajibPembeli, apiLogin, apiSeller, apiBuyer };
