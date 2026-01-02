const jwt = require("jsonwebtoken");

const SECRET_KEY =
  process.env.JWT_SECRET || "your-default-secret-key-change-in-production";

// Token expires in 2 hours
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "2h";

function signToken(value) {
  return jwt.sign(value, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
}

function verifyToken(value) {
  return jwt.verify(value, SECRET_KEY);
}

module.exports = {
  signToken,
  verifyToken,
};
