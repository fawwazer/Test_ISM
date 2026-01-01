const jwt = require("jsonwebtoken");

const SECRET_KEY =
  process.env.JWT_SECRET || "your-default-secret-key-change-in-production";

function signToken(value) {
  return jwt.sign(value, SECRET_KEY);
}

function verifyToken(value) {
  return jwt.verify(value, SECRET_KEY);
}

module.exports = {
  signToken,
  verifyToken,
};
