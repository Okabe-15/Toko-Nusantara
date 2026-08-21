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

module.exports = { wajibLogin, wajibPenjual, wajibPembeli };
