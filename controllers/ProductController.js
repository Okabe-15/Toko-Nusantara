'use strict';

const { Product, Category } = require('../models');
const { hapusBerkasTerunggah } = require('../middlewares/upload');

class ProductController {
  //>>> Halaman utama produk dengan pencarian, filter kategori, dan pengurutan
  static async daftarProduk(req, res) {
    try {
      const { keyword, categoryId, sort, error, notification } = req.query;

      const daftarProduk = await Product.findByFilter(keyword, categoryId, sort);
      const daftarKategori = await Category.findAll({ order: [['name', 'ASC']] });

      res.render('products', {
        daftarProduk,
        daftarKategori,
        keyword: keyword || '',
        categoryId: categoryId || '',
        sort: sort || 'terbaru',
        error,
        notification,
        session: req.session
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async detailProduk(req, res) {
    try {
      const { id } = req.params;
      const produk = await Product.findByPk(id, {
        include: [{ model: Category }]
      });

      if (!produk) {
        const pesan = 'Produk yang kamu cari tidak ditemukan';
        return res.redirect(`/products?error=${encodeURIComponent(pesan)}`);
      }

      res.render('productDetail', { produk, session: req.session });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async formTambah(req, res) {
    try {
      const { error } = req.query;
      const daftarKategori = await Category.findAll({ order: [['name', 'ASC']] });

      res.render('productForm', {
        produk: null,
        daftarKategori,
        error,
        session: req.session
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async prosesTambah(req, res) {
    try {
      const { name, description, price, CategoryId } = req.body;

      await Product.create({
        name,
        description,
        price,
        imageUrl: req.file ? `/assets/uploads/${req.file.filename}` : null,
        CategoryId
      });

      const pesan = `Produk ${name} berhasil ditambahkan ke katalog`;
      res.redirect(`/profile?notification=${encodeURIComponent(pesan)}`);
    } catch (error) {
      hapusBerkasTerunggah(req.file);

      if (error.name === 'SequelizeValidationError') {
        const daftarPesan = error.errors.map(baris => baris.message).join(', ');
        return res.redirect(`/products/add?error=${encodeURIComponent(daftarPesan)}`);
      }
      res.send(error.message);
    }
  }

  static async formEdit(req, res) {
    try {
      const { id } = req.params;
      const { error } = req.query;

      const produk = await Product.findByPk(id);
      const daftarKategori = await Category.findAll({ order: [['name', 'ASC']] });

      if (!produk) {
        const pesan = 'Produk yang kamu cari tidak ditemukan';
        return res.redirect(`/profile?error=${encodeURIComponent(pesan)}`);
      }

      res.render('productForm', { produk, daftarKategori, error, session: req.session });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async prosesEdit(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, CategoryId } = req.body;

      const produkLama = await Product.findByPk(id);
      if (!produkLama) {
        hapusBerkasTerunggah(req.file);
        const pesan = 'Produk yang kamu ubah tidak ditemukan';
        return res.redirect(`/profile?error=${encodeURIComponent(pesan)}`);
      }

      // Gambar lama dipertahankan bila penjual tidak mengunggah gambar baru
      const alamatGambar = req.file
        ? `/assets/uploads/${req.file.filename}`
        : produkLama.imageUrl;

      await Product.update(
        { name, description, price, imageUrl: alamatGambar, CategoryId },
        { where: { id }, individualHooks: true }
      );

      const pesan = `Produk ${name} berhasil diperbarui`;
      res.redirect(`/profile?notification=${encodeURIComponent(pesan)}`);
    } catch (error) {
      hapusBerkasTerunggah(req.file);

      if (error.name === 'SequelizeValidationError') {
        const daftarPesan = error.errors.map(baris => baris.message).join(', ');
        return res.redirect(`/products/${req.params.id}/edit?error=${encodeURIComponent(daftarPesan)}`);
      }
      res.send(error.message);
    }
  }

  // Penghapusan produk memakai promise chaining agar notifikasi memuat nama produk
  static hapusProduk(req, res) {
    const { id } = req.params;
    let namaProduk = '';

    Product.findByPk(id)
      .then(produk => {
        if (!produk) {
          throw new Error('Produk yang kamu hapus tidak ditemukan');
        }
        namaProduk = produk.name;
        return Product.destroy({ where: { id } });
      })
      .then(() => {
        const pesan = `Produk ${namaProduk} berhasil dihapus dari katalog`;
        res.redirect(`/profile?notification=${encodeURIComponent(pesan)}`);
      })
      .catch(error => {
        res.redirect(`/profile?error=${encodeURIComponent(error.message)}`);
      });
  }
}

module.exports = ProductController;
