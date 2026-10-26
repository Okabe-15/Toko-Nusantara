'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'apiTokenVersion', {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.INTEGER
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'apiTokenVersion');
  }
};
