const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

async function Authentication(req, res, next) {
  const bearer_token = req.headers.authorization;
  if (!bearer_token) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const access_token = bearer_token.split(" ")[1];
    const payload = verifyToken(access_token);

    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(500).json({ message: "Internal Server error" });
  }
}

module.exports = Authentication;
