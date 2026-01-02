function errorHandler(err, req, res, next) {
  console.error(err);

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({
      message: err.errors[0].message,
    });
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
}

module.exports = errorHandler;
