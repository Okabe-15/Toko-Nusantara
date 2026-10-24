'use strict';

const dataProduk = require('../product.json');

module.exports = {
  async up(queryInterface, Sequelize) {
    const daftarProduk = dataProduk.map(produk => {
      return {
        name: produk.name,
        description: produk.description,
        price: produk.price,
        imageUrl: produk.imageUrl,
        CategoryId: produk.CategoryId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    await queryInterface.bulkInsert('Products', daftarProduk, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true
    });
  }
};
