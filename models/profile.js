'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: 'UserId' });
    }

    //>>> cek belanjaan muat
    isWithinBudget(totalBelanja) {
      if (!this.budgetLimit) return true;
      return totalBelanja <= this.budgetLimit;
    }

    //>>> sisa anggaran yang masih tersedia
    sisaBudget(totalBelanja) {
      if (!this.budgetLimit) return null;
      return this.budgetLimit - totalBelanja;
    }
  }

  Profile.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Profil harus terhubung dengan akun pengguna' }
      }
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Nama lengkap wajib diisi' },
        notEmpty: { msg: 'Nama lengkap tidak boleh kosong' }
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Nomor telepon wajib diisi' },
        notEmpty: { msg: 'Nomor telepon tidak boleh kosong' },
        is: {
          args: /^08[0-9]{8,12}$/,
          msg: 'Nomor telepon harus diawali 08 dan terdiri dari 10 sampai 14 angka'
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Alamat wajib diisi' },
        notEmpty: { msg: 'Alamat tidak boleh kosong' }
      }
    },
    budgetLimit: {
      type: DataTypes.INTEGER,
      validate: {
        min: {
          args: [0],
          msg: 'Batas anggaran tidak boleh bernilai negatif'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Profile'
  });

  return Profile;
};
