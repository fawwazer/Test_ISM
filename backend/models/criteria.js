"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Criteria extends Model {
    static associate(models) {
      Criteria.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
      });
      Criteria.hasMany(models.ScoreOption, {
        foreignKey: "criteriaId",
        as: "scoreOptions",
      });
      Criteria.hasMany(models.ApplicationScore, {
        foreignKey: "criteriaId",
        as: "applicationScores",
      });
    }
  }
  Criteria.init(
    {
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Criteria",
      tableName: "Criteria",
    }
  );
  return Criteria;
};
