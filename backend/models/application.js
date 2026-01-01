"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Application.hasMany(models.ApplicationScore, {
        foreignKey: "applicationId",
        as: "scores",
      });
    }
  }
  Application.init(
    {
      applicationNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      applicantName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      applicationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      categoryScores: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      categoryFinalScores: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      totalScore: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Application",
      tableName: "Applications",
    }
  );
  return Application;
};
