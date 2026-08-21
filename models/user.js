'use strict';

const { Model } = require('sequelize');
const { hashPassword } = require('../helpers/passwordHelper');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Profile, { foreignKey: 'UserId' });
      User.hasMany(models.Cart, { foreignKey: 'UserId' });
      User.belongsToMany(models.Product, {
        through: models.Cart,
        as: 'CartProducts',
        foreignKey: 'UserId',
        otherKey: 'ProductId'
      });
    }

    //>>> pengguna beserta profilnya disini gess
    static async findWithProfile(userId) {
      const { Profile } = sequelize.models;
      return await User.findByPk(userId, {
        include: [{ model: Profile }]
      });
    }

    //>>> menampilkan label
    get labelPeran() {
      return this.role === 'seller' ? 'Penjual' : 'Pembeli';
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [3, 30],
          msg: 'Username minimal 3 karakter dan maksimal 30 karakter'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email sudah terdaftar, silakan gunakan email lain'
      },
      validate: {
        notNull: { msg: 'Email wajib diisi' },
        notEmpty: { msg: 'Email tidak boleh kosong' },
        isEmail: { msg: 'Format email tidak valid' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password wajib diisi' },
        notEmpty: { msg: 'Password tidak boleh kosong' },
        len: {
          args: [8, 255],
          msg: 'Password minimal 8 karakter'
        }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'buyer',
      validate: {
        notNull: { msg: 'Peran wajib dipilih' },
        isIn: {
          args: [['buyer', 'seller']],
          msg: 'Peran hanya boleh buyer atau seller'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      //>>> enkripsi password sebelum baris disimpan
      beforeCreate: (user) => {
        user.password = hashPassword(user.password);
      }
    }
  });

  return User;
};
