'use strict';

const { Model } = require('sequelize');
const { formatRupiah } = require('../helpers/formatHelper');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'UserId' });
      Cart.belongsTo(models.Product, { foreignKey: 'ProductId' });
    }

    //>>> seluruh isi keranjang milik satu pembeli
    static async findByUser(userId) {
      const { Product, Category } = sequelize.models;
      return await Cart.findAll({
        where: { UserId: userId },
        include: [
          { model: Product, include: [{ model: Category }] }
        ],
        order: [['createdAt', 'ASC']]
      });
    }

    //>>> harga dikali jumlah barang
    hitungSubtotal() {
      if (!this.Product) return 0;
      return this.Product.price * this.quantity;
    }

    //>>> subtotal yang sudah diformat rupiah
    get subtotalRupiah() {
      return formatRupiah(this.hitungSubtotal());
    }
  }

  Cart.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Keranjang harus terhubung dengan akun pembeli' }
      }
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Produk wajib dipilih' }
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: { msg: 'Jumlah barang wajib diisi' },
        isInt: { msg: 'Jumlah barang harus berupa angka bulat' },
        min: {
          args: [1],
          msg: 'Jumlah barang minimal 1'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Cart'
  });

  return Cart;
};
