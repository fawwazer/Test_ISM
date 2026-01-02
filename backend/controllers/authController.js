const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

class AuthController {
  static async register(req, res, next) {
    try {
      const {
        nama,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        kodePos,
        alamat,
        email,
        password,
      } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const newUser = await User.create({
        nama,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        kodePos,
        alamat,
        email,
        password,
        role: "user",
      });

      res.status(201).json({
        message: "User registered successfully",
        data: {
          id: newUser.id,
          nama: newUser.nama,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken({ id: user.id, role: user.role });

      res.status(200).json({
        message: "Login successful",
        access_token: token,
        data: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
