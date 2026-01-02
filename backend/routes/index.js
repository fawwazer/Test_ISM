const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const ScoringController = require("../controllers/scoringController");
const errorHandler = require("../middleware/errorHandler");

const officerRoutes = require("./officer");

router.get("/", (req, res) => {
  res.send("Credit Scoring System API");
});

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.get("/scoring-structure", ScoringController.getScoringStructure);

router.use("/", officerRoutes);

router.use(errorHandler);

module.exports = router;
