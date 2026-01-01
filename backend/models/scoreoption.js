"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ScoreOption extends Model {
    static associate(models) {
      ScoreOption.belongsTo(models.Criteria, {
        foreignKey: "criteriaId",
        as: "criteria",
      });
      ScoreOption.hasMany(models.ApplicationScore, {
        foreignKey: "scoreOptionId",
        as: "applicationScores",
      });
    }
  }
  ScoreOption.init(
    {
      criteriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
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
      modelName: "ScoreOption",
      tableName: "ScoreOptions",
    }
  );
  return ScoreOption;
};
