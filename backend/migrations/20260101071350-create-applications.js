"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Applications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      applicationNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: "No Aplikasi - Auto generated",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      applicantName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicationDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      categoryScores: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Sum(F*D) per kategori - format: {categoryId: sumFD}",
      },
      categoryFinalScores: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Sum(F*D) * B per kategori - format: {categoryId: sumFD_x_B}",
      },
      totalScore: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: "Total dari semua Sum(F*D) * B",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Applications");
  },
};
