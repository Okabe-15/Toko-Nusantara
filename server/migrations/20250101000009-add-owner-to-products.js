'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'UserId', {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.addIndex('Products', ['UserId'], {
      name: 'products_user_id_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Products', 'products_user_id_idx');
    await queryInterface.removeColumn('Products', 'UserId');
  }
};
