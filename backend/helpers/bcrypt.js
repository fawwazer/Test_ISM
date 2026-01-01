const bcrypt = require("bcryptjs");

function hashPassword(password) {
  const hash = bcrypt.hashSync(password, 10);
  return hash;
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
