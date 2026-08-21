'use strict';

const { Cart, Product, Profile } = require('../models');
const { hitungTotalBelanja, formatRupiah } = require('../helpers/formatHelper');

class CartController {
  // Halaman keranjang menggabungkan Carts, Products, Categories, dan Profiles
  static async halamanKeranjang(req, res) {
    try {
      const { error, notification } = req.query;

      const daftarKeranjang = await Cart.findByUser(req.session.userId);
      const profil = await Profile.findOne({ where: { UserId: req.session.userId } });

      const totalBelanja = hitungTotalBelanja(daftarKeranjang);
      const melebihiBudget = profil ? !profil.isWithinBudget(totalBelanja) : false;
      const sisaBudget = profil ? profil.sisaBudget(totalBelanja) : null;

      res.render('cart', {
        daftarKeranjang,
        profil,
        totalBelanja,
        melebihiBudget,
        sisaBudget,
        formatRupiah,
        error,
        notification,
        session: req.session
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async tambahKeKeranjang(req, res) {
    try {
      const { ProductId } = req.body;

      const produk = await Product.findByPk(ProductId);
      if (!produk) {
        const pesan = 'Produk yang kamu pilih tidak ditemukan';
        return res.redirect(`/products?error=${encodeURIComponent(pesan)}`);
      }

      const barisKeranjang = await Cart.findOne({
        where: { UserId: req.session.userId, ProductId }
      });

      if (barisKeranjang) {
        await barisKeranjang.increment('quantity', { by: 1 });
      } else {
        await Cart.create({ UserId: req.session.userId, ProductId, quantity: 1 });
      }

      const pesan = `${produk.name} berhasil masuk ke keranjang`;
      res.redirect(`/carts?notification=${encodeURIComponent(pesan)}`);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const daftarPesan = error.errors.map(baris => baris.message).join(', ');
        return res.redirect(`/products?error=${encodeURIComponent(daftarPesan)}`);
      }
      res.send(error.message);
    }
  }

  static async ubahJumlah(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      await Cart.update(
        { quantity },
        { where: { id, UserId: req.session.userId }, individualHooks: true }
      );

      const pesan = 'Jumlah barang berhasil diperbarui';
      res.redirect(`/carts?notification=${encodeURIComponent(pesan)}`);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const daftarPesan = error.errors.map(baris => baris.message).join(', ');
        return res.redirect(`/carts?error=${encodeURIComponent(daftarPesan)}`);
      }
      res.send(error.message);
    }
  }

  // Penghapusan isi keranjang memakai promise chaining
  static hapusDariKeranjang(req, res) {
    const { id } = req.params;
    let namaProduk = '';

    Cart.findOne({
      where: { id, UserId: req.session.userId },
      include: [{ model: Product }]
    })
      .then(barisKeranjang => {
        if (!barisKeranjang) {
          throw new Error('Barang tidak ditemukan di keranjang kamu');
        }
        namaProduk = barisKeranjang.Product.name;
        return Cart.destroy({ where: { id } });
      })
      .then(() => {
        const pesan = `${namaProduk} berhasil dikeluarkan dari keranjang`;
        res.redirect(`/carts?notification=${encodeURIComponent(pesan)}`);
      })
      .catch(error => {
        res.redirect(`/carts?error=${encodeURIComponent(error.message)}`);
      });
  }
}

module.exports = CartController;
