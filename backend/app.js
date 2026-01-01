const express = require("express");
const Controller = require("./controllers/controller");
const Authentication = require("./middleware/authentications");
const checkRole = require("./middleware/authorization");
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", Controller.register);
app.post("/login", Controller.login);

app.get("/scoring-structure", Controller.getScoringStructure);

// User routes (role: user)
app.post(
  "/applications/draft",
  Authentication,
  checkRole("user"),
  Controller.submitApplicationDraft
);

// Officer routes (role: officer, admin)
app.get(
  "/applications/drafts",
  Authentication,
  checkRole("officer", "admin"),
  Controller.getDraftApplications
);
app.post(
  "/applications/:id/assess",
  Authentication,
  checkRole("officer", "admin"),
  Controller.completeAssessment
);

// Common authenticated routes
app.post("/applications", Authentication, Controller.submitApplication);
app.get("/applications", Authentication, Controller.getApplications);
app.get("/applications/:id", Authentication, Controller.getApplicationDetail);
app.get(
  "/applications/:id/report",
  Authentication,
  Controller.getApplicationReport
);

app.use((err, req, res, next) => {
  console.error(err);

  // Sequelize validation error
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({
      message: err.errors[0].message,
    });
  }

  // Default error
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
