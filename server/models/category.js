'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, { foreignKey: 'CategoryId' });
    }

    //>>> ini daftar kategori beserta jumlah produknya
    static async findAllWithProductCount() {
      const { Product } = sequelize.models;
      return await Category.findAll({
        include: [{ model: Product, attributes: ['id'] }],
        order: [['name', 'ASC']]
      });
    }
  }

  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Nama kategori wajib diisi' },
        notEmpty: { msg: 'Nama kategori tidak boleh kosong' }
      }
    }
  }, {
    sequelize,
    modelName: 'Category'
  });

  return Category;
};
