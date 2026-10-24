'use strict';

const { Model, Op } = require('sequelize');
const { formatRupiah, potongTeks } = require('../helpers/formatHelper');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'CategoryId' });
      Product.hasMany(models.Cart, { foreignKey: 'ProductId' });
      Product.belongsToMany(models.User, {
        through: models.Cart,
        as: 'Buyers',
        foreignKey: 'ProductId',
        otherKey: 'UserId'
      });
    }

    //>>> pencarian dan pengurutan
    static async findByFilter(keyword, categoryId, sort) {
      const { Category } = sequelize.models;
      const kondisi = {};

      if (keyword) {
        kondisi[Op.or] = [
          { name: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } }
        ];
      }

      if (categoryId) {
        kondisi.CategoryId = categoryId;
      }

      const daftarUrutan = {
        termurah: [['price', 'ASC']],
        termahal: [['price', 'DESC']],
        nama: [['name', 'ASC']],
        terbaru: [['createdAt', 'DESC']]
      };

      return await Product.findAll({
        where: kondisi,
        include: [{ model: Category }],
        order: daftarUrutan[sort] || daftarUrutan.terbaru
      });
    }

    //>>> produk termurah untuk ditampilkan
    static async findTerjangkau(batasHarga) {
      const { Category } = sequelize.models;
      return await Product.findAll({
        where: { price: { [Op.lte]: batasHarga } },
        include: [{ model: Category }],
        order: [['price', 'ASC']],
        limit: 6
      });
    }

    //>>> harga dalam format rupiah
    get hargaRupiah() {
      return formatRupiah(this.price);
    }

    //deskripsi singkat untuk kartu produk
    get deskripsiSingkat() {
      return potongTeks(this.description, 90);
    }
  }

  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Nama produk wajib diisi' },
        notEmpty: { msg: 'Nama produk tidak boleh kosong' },
        len: {
          args: [3, 100],
          msg: 'Nama produk minimal 3 karakter dan maksimal 100 karakter'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Deskripsi produk wajib diisi' },
        notEmpty: { msg: 'Deskripsi produk tidak boleh kosong' },
        len: {
          args: [10, 255],
          msg: 'Deskripsi produk minimal 10 karakter'
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Harga produk wajib diisi' },
        isInt: { msg: 'Harga produk harus berupa angka bulat' },
        min: {
          args: [1000],
          msg: 'Harga produk minimal Rp 1.000'
        }
      }
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Kategori produk wajib dipilih' }
      }
    }
  }, {
    sequelize,
    modelName: 'Product'
  });

  return Product;
};
