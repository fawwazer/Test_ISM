"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ApplicationScores", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Applications",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      criteriaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Criteria",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      scoreOptionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ScoreOptions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "BOBOT F - Score dari pilihan",
      },
      criteriaWeight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: "BOBOT D - Weight dari criteria",
      },
      weightedScore: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "F * D - Hasil perkalian score dan weight",
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
    await queryInterface.dropTable("ApplicationScores");
  },
};
