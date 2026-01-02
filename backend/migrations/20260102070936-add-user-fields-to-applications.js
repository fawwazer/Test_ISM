"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Applications", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Applications", "userManualData", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Applications", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.removeColumn("Applications", "userManualData");
  },
};
