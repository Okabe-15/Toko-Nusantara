'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      );

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'session_pkey'
            AND conrelid = '"session"'::regclass
        ) THEN
          ALTER TABLE "session"
            ADD CONSTRAINT "session_pkey"
            PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
      END
      $$;

      CREATE INDEX IF NOT EXISTS "IDX_session_expire"
        ON "session" ("expire");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "IDX_session_expire";
      DROP TABLE IF EXISTS "session";
    `);
  }
};
