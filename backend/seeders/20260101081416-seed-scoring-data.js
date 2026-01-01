"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const categories = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data/categories.json"), "utf8")
    );
    const criteria = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data/criteria.json"), "utf8")
    );
    const scoreOptions = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data/scoreOptions.json"), "utf8")
    );

    await queryInterface.bulkInsert(
      "Categories",
      categories.map((item) => ({ ...item, createdAt: now, updatedAt: now }))
    );
    await queryInterface.bulkInsert(
      "Criteria",
      criteria.map((item) => ({ ...item, createdAt: now, updatedAt: now }))
    );
    await queryInterface.bulkInsert(
      "ScoreOptions",
      scoreOptions.map((item) => ({ ...item, createdAt: now, updatedAt: now }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ScoreOptions", null, {});
    await queryInterface.bulkDelete("Criteria", null, {});
    await queryInterface.bulkDelete("Categories", null, {});
  },
};
