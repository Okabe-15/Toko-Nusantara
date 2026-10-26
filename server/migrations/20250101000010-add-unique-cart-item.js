'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      WITH duplicate_groups AS (
        SELECT MIN(id) AS keep_id, "UserId", "ProductId", SUM(quantity) AS total_quantity
        FROM "Carts"
        GROUP BY "UserId", "ProductId"
        HAVING COUNT(*) > 1
      ), updated AS (
        UPDATE "Carts" AS cart
        SET quantity = groups.total_quantity, "updatedAt" = NOW()
        FROM duplicate_groups AS groups
        WHERE cart.id = groups.keep_id
        RETURNING cart.id
      )
      DELETE FROM "Carts" AS cart
      USING duplicate_groups AS groups
      WHERE cart."UserId" = groups."UserId"
        AND cart."ProductId" = groups."ProductId"
        AND cart.id <> groups.keep_id;
    `);
    await queryInterface.addIndex('Carts', ['UserId', 'ProductId'], {
      unique: true,
      name: 'carts_user_product_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Carts', 'carts_user_product_unique');
  }
};
