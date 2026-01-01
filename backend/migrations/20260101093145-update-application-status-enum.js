"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // PostgreSQL: Update ENUM type by creating new type and switching
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Applications_status" ADD VALUE IF NOT EXISTS 'draft';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Applications_status" ADD VALUE IF NOT EXISTS 'assessed';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Rollback is complex for enum in PostgreSQL
    // Would need to recreate the enum without 'draft' and 'assessed'
    // For simplicity, we'll just note that this cannot be easily undone
    console.log(
      "Rollback of enum values is not supported. Please restore from backup if needed."
    );
  },
};
