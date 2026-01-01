"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ApplicationScore extends Model {
    static associate(models) {
      ApplicationScore.belongsTo(models.Application, {
        foreignKey: "applicationId",
        as: "application",
      });
      ApplicationScore.belongsTo(models.Criteria, {
        foreignKey: "criteriaId",
        as: "criteria",
      });
      ApplicationScore.belongsTo(models.ScoreOption, {
        foreignKey: "scoreOptionId",
        as: "scoreOption",
      });
    }
  }
  ApplicationScore.init(
    {
      applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      criteriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      scoreOptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      criteriaWeight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      weightedScore: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ApplicationScore",
      tableName: "ApplicationScores",
    }
  );
  return ApplicationScore;
};
