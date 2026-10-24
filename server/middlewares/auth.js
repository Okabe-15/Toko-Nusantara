'use strict';

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

function apiLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: { message: 'Silakan login terlebih dahulu untuk melanjutkan' } });
  }
  next();
}

function apiSeller(req, res, next) {
  if (req.session.role !== 'seller') {
    return res.status(403).json({ error: { message: 'Operasi ini hanya dapat dilakukan oleh penjual' } });
  }
  next();
}

function apiBuyer(req, res, next) {
  if (req.session.role !== 'buyer') {
    return res.status(403).json({ error: { message: 'Operasi ini hanya dapat dilakukan oleh pembeli' } });
  }
  next();
}

module.exports = { wajibLogin, wajibPenjual, wajibPembeli, apiLogin, apiSeller, apiBuyer };
