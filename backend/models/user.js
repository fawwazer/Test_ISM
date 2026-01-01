"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Application, {
        foreignKey: "userId",
        as: "applications",
      });
    }
  }
  User.init(
    {
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tempatLahir: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tanggalLahir: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      jenisKelamin: {
        type: DataTypes.ENUM("L", "P"),
        allowNull: false,
      },
      kodePos: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      alamat: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
