'use strict';

const { User, Profile, Product, Category } = require('../models');
const { comparePassword } = require('../helpers/passwordHelper');

class UserController {
  // Landing page yang menggambarkan isi marketplace
  static async landingPage(req, res) {
    try {
      const daftarKategori = await Category.findAllWithProductCount();
      const produkTerjangkau = await Product.findTerjangkau(200000);
      const jumlahProduk = await Product.count();

      res.render('home', {
        daftarKategori,
        produkTerjangkau,
        jumlahProduk,
        session: req.session
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static formRegister(req, res) {
    const { error } = req.query;
    res.render('register', { error, session: req.session });
  }

  static async prosesRegister(req, res) {
    try {
      const { username, email, password, role, fullName, phoneNumber, address } = req.body;

      const penggunaBaru = await User.create({ username, email, password, role });
      await Profile.create({
        UserId: penggunaBaru.id,
        fullName,
        phoneNumber,
        address
      });

      const pesan = 'Pendaftaran berhasil, silakan login dengan akun kamu';
      res.redirect(`/login?notification=${encodeURIComponent(pesan)}`);
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const daftarPesan = error.errors.map(baris => baris.message).join(', ');
        return res.redirect(`/register?error=${encodeURIComponent(daftarPesan)}`);
      }
      res.send(error.message);
    }
  }

  static formLogin(req, res) {
    const { error, notification } = req.query;
    res.render('login', { error, notification, session: req.session });
  }

  static async prosesLogin(req, res) {
    try {
      const { email, password } = req.body;
      const pengguna = await User.findOne({ where: { email } });

      if (!pengguna || !comparePassword(password, pengguna.password)) {
        const pesan = 'Email atau password yang kamu masukkan salah';
        return res.redirect(`/login?error=${encodeURIComponent(pesan)}`);
      }

      req.session.userId = pengguna.id;
      req.session.username = pengguna.username;
      req.session.role = pengguna.role;

      res.redirect('/products');
    } catch (error) {
      res.send(error.message);
    }
  }

  static logout(req, res) {
    req.session.destroy((error) => {
      if (error) return res.send(error.message);
      res.redirect('/');
    });
  }

  //>>> Halaman profil dengan eager loading dua tabel
  static async halamanProfil(req, res) {
    try {
      const { error, notification } = req.query;
      const pengguna = await User.findWithProfile(req.session.userId);

      //>>> Penjual melihat seluruh katalog
      const daftarProduk = req.session.role === 'seller'
        ? await Product.findAll({ include: [{ model: Category }], order: [['createdAt', 'DESC']] })
        : [];

      res.render('profile', {
        pengguna,
        daftarProduk,
        error,
        notification,
        session: req.session
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async ubahBudget(req, res) {
    try {
      const { budgetLimit } = req.body;

      await Profile.update(
        { budgetLimit: budgetLimit || null },
        { where: { UserId: req.session.userId }, individualHooks: true }
      );

      const pesan = 'Batas anggaran belanja berhasil diperbarui';
      res.redirect(`/profile?notification=${encodeURIComponent(pesan)}`);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const daftarPesan = error.errors.map(baris => baris.message).join(', ');
        return res.redirect(`/profile?error=${encodeURIComponent(daftarPesan)}`);
      }
      res.send(error.message);
    }
  }
}

module.exports = UserController;
