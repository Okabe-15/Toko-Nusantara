'use strict';

const { hashPassword } = require('../helpers/passwordHelper');

const dataPengguna = [
  { username: 'tokobatikarum', email: 'penjual1@mail.com', password: 'rahasia123', role: 'seller' },
  { username: 'ariefrizky', email: 'pembeli1@mail.com', password: 'rahasia123', role: 'buyer' },
  { username: 'nusantaracraft', email: 'penjual2@mail.com', password: 'rahasia123', role: 'seller' }
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const daftarPengguna = dataPengguna.map(pengguna => {
      return {
        username: pengguna.username,
        email: pengguna.email,
        password: hashPassword(pengguna.password),
        role: pengguna.role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    await queryInterface.bulkInsert('Users', daftarPengguna, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true
    });
  }
};
