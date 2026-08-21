'use strict';

// Migration tambahan: menambah kolom batas anggaran belanja pada tabel Profiles
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Profiles', 'budgetLimit', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Profiles', 'budgetLimit');
  }
};
