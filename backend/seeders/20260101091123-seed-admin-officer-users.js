"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "Users",
      [
        {
          nama: "Admin System",
          tempatLahir: "Jakarta",
          tanggalLahir: "1990-01-01",
          jenisKelamin: "L",
          kodePos: "12345",
          alamat: "Jl. Admin No. 1",
          email: "admin@system.com",
          password: bcrypt.hashSync("Admin123!", 10),
          role: "admin",
          createdAt: now,
          updatedAt: now,
        },
        {
          nama: "Credit Officer 1",
          tempatLahir: "Bandung",
          tanggalLahir: "1992-05-15",
          jenisKelamin: "L",
          kodePos: "40111",
          alamat: "Jl. Officer No. 10",
          email: "officer1@system.com",
          password: bcrypt.hashSync("Officer123!", 10),
          role: "officer",
          createdAt: now,
          updatedAt: now,
        },
        {
          nama: "Credit Officer 2",
          tempatLahir: "Surabaya",
          tanggalLahir: "1993-08-20",
          jenisKelamin: "P",
          kodePos: "60111",
          alamat: "Jl. Officer No. 20",
          email: "officer2@system.com",
          password: bcrypt.hashSync("Officer123!", 10),
          role: "officer",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Users",
      {
        email: {
          [Sequelize.Op.in]: [
            "admin@system.com",
            "officer1@system.com",
            "officer2@system.com",
          ],
        },
      },
      {}
    );
  },
};
