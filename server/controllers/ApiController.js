'use strict';

const { User, Profile, Category, Product, Cart, sequelize } = require('../models');
const { comparePassword } = require('../helpers/passwordHelper');
const { hitungTotalBelanja } = require('../helpers/formatHelper');
const { hapusBerkasTerunggah } = require('../middlewares/upload');

function validationMessage(error) {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return error.errors.map(item => item.message).join(', ');
  }
  return null;
}

function publicUser(user) {
  return {
    id: user.id, username: user.username, email: user.email, role: user.role,
    Profile: user.Profile ? {
      id: user.Profile.id, fullName: user.Profile.fullName,
      phoneNumber: user.Profile.phoneNumber, address: user.Profile.address,
      budgetLimit: user.Profile.budgetLimit
    } : undefined
  };
}

function publicProduct(product, req) {
  const value = product.toJSON();
  if (value.imageUrl && value.imageUrl.startsWith('/')) {
    value.imageUrl = `${req.protocol}://${req.get('host')}${value.imageUrl}`;
  }
  return { ...value, hargaRupiah: product.hargaRupiah, Category: product.Category };
}

class ApiController {
  static async register(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { username, email, password, role, fullName, phoneNumber, address } = req.body;
      const user = await User.create({ username, email, password, role }, { transaction });
      await Profile.create({ UserId: user.id, fullName, phoneNumber, address }, { transaction });
      await transaction.commit();
      return res.status(201).json({ message: 'Pendaftaran berhasil', data: { id: user.id } });
    } catch (error) {
      await transaction.rollback();
      const message = validationMessage(error);
      return res.status(message ? 400 : 500).json({ error: { message: message || 'Pendaftaran gagal' } });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email }, include: [{ model: Profile }] });
      if (!user || !comparePassword(password || '', user.password)) {
        return res.status(401).json({ error: { message: 'Email atau password yang kamu masukkan salah' } });
      }
      await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      return res.json({ message: 'Login berhasil', data: publicUser(user) });
    } catch (error) {
      return res.status(500).json({ error: { message: 'Login gagal' } });
    }
  }

  static logout(req, res) {
    req.session.destroy(error => {
      if (error) return res.status(500).json({ error: { message: 'Logout gagal' } });
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logout berhasil' });
    });
  }

  static async me(req, res) {
    if (!req.session.userId) return res.status(401).json({ error: { message: 'Belum login' } });
    const user = await User.findWithProfile(req.session.userId);
    if (!user) return res.status(401).json({ error: { message: 'Sesi tidak valid' } });
    return res.json({ message: 'Pengguna aktif', data: publicUser(user) });
  }

  static async categories(req, res) {
    const data = await Category.findAllWithProductCount();
    return res.json({ message: 'Kategori berhasil diambil', data });
  }

  static async home(req, res) {
    const [categories, affordableProducts, productCount] = await Promise.all([
      Category.findAllWithProductCount(),
      Product.findTerjangkau(200000),
      Product.count()
    ]);
    const products = affordableProducts.map(product => publicProduct(product, req));
    return res.json({
      message: 'Data beranda berhasil diambil',
      data: {
        categories,
        products,
        productCount,
        cheapestPrice: products.length ? Math.min(...products.map(product => Number(product.price))) : null
      }
    });
  }

  static async products(req, res) {
    const data = await Product.findByFilter(req.query.keyword, req.query.categoryId, req.query.sort);
    return res.json({ message: 'Produk berhasil diambil', data: data.map(product => publicProduct(product, req)) });
  }

  static async product(req, res) {
    const data = await Product.findByPk(req.params.id, { include: [{ model: Category }] });
    if (!data) return res.status(404).json({ error: { message: 'Produk tidak ditemukan' } });
    return res.json({ message: 'Produk berhasil diambil', data: publicProduct(data, req) });
  }

  static async createProduct(req, res) {
    try {
      const { name, description, price, CategoryId } = req.body;
      const data = await Product.create({
        name, description, price, CategoryId,
        imageUrl: req.file ? `/assets/uploads/${req.file.filename}` : null
      });
      return res.status(201).json({ message: 'Produk berhasil ditambahkan', data });
    } catch (error) {
      hapusBerkasTerunggah(req.file);
      const message = validationMessage(error);
      return res.status(message ? 400 : 500).json({ error: { message: message || 'Produk gagal ditambahkan' } });
    }
  }

  static async updateProduct(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        hapusBerkasTerunggah(req.file);
        return res.status(404).json({ error: { message: 'Produk tidak ditemukan' } });
      }
      const { name, description, price, CategoryId } = req.body;
      await product.update({
        name, description, price, CategoryId,
        imageUrl: req.file ? `/assets/uploads/${req.file.filename}` : product.imageUrl
      }, { individualHooks: true });
      return res.json({ message: 'Produk berhasil diperbarui', data: product });
    } catch (error) {
      hapusBerkasTerunggah(req.file);
      const message = validationMessage(error);
      return res.status(message ? 400 : 500).json({ error: { message: message || 'Produk gagal diperbarui' } });
    }
  }

  static async deleteProduct(req, res) {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: { message: 'Produk tidak ditemukan' } });
    return res.status(204).send();
  }

  static async profile(req, res) {
    const user = await User.findWithProfile(req.session.userId);
    if (!user) return res.status(404).json({ error: { message: 'Profil tidak ditemukan' } });
    return res.json({ message: 'Profil berhasil diambil', data: publicUser(user) });
  }

  static async budget(req, res) {
    try {
      const [count] = await Profile.update({ budgetLimit: req.body.budgetLimit || null }, {
        where: { UserId: req.session.userId }, individualHooks: true
      });
      if (!count) return res.status(404).json({ error: { message: 'Profil tidak ditemukan' } });
      return res.json({ message: 'Batas anggaran berhasil diperbarui' });
    } catch (error) {
      const message = validationMessage(error);
      return res.status(message ? 400 : 500).json({ error: { message: message || 'Profil gagal diperbarui' } });
    }
  }

  static async cart(req, res) {
    const items = await Cart.findByUser(req.session.userId);
    const profile = await Profile.findOne({ where: { UserId: req.session.userId } });
    const total = hitungTotalBelanja(items);
    return res.json({
      message: 'Keranjang berhasil diambil',
      data: {
        items: items.map(item => ({ ...item.toJSON(), subtotal: item.hitungSubtotal() })),
        total, budgetLimit: profile && profile.budgetLimit,
        remainingBudget: profile ? profile.sisaBudget(total) : null,
        exceedsBudget: profile ? !profile.isWithinBudget(total) : false
      }
    });
  }

  static async addCartItem(req, res) {
    const product = await Product.findByPk(req.body.ProductId);
    if (!product) return res.status(404).json({ error: { message: 'Produk tidak ditemukan' } });
    const [item, created] = await Cart.findOrCreate({
      where: { UserId: req.session.userId, ProductId: req.body.ProductId },
      defaults: { quantity: 1 }
    });
    if (!created) await item.increment('quantity');
    return res.status(created ? 201 : 200).json({ message: 'Keranjang berhasil diperbarui' });
  }

  static async updateCartItem(req, res) {
    try {
      const [count] = await Cart.update({ quantity: req.body.quantity }, {
        where: { id: req.params.id, UserId: req.session.userId }, individualHooks: true
      });
      if (!count) return res.status(404).json({ error: { message: 'Barang tidak ditemukan di keranjang' } });
      return res.json({ message: 'Jumlah barang berhasil diperbarui' });
    } catch (error) {
      const message = validationMessage(error);
      return res.status(message ? 400 : 500).json({ error: { message: message || 'Keranjang gagal diperbarui' } });
    }
  }

  static async deleteCartItem(req, res) {
    const count = await Cart.destroy({ where: { id: req.params.id, UserId: req.session.userId } });
    if (!count) return res.status(404).json({ error: { message: 'Barang tidak ditemukan di keranjang' } });
    return res.status(204).send();
  }
}

module.exports = ApiController;
