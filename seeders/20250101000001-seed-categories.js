'use strict';

const dataKategori = require('../category.json');

module.exports = {
  async up(queryInterface, Sequelize) {
    const daftarKategori = dataKategori.map(kategori => {
      return {
        name: kategori.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    await queryInterface.bulkInsert('Categories', daftarKategori, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true
    });
  }
};
