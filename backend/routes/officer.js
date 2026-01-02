const express = require("express");
const router = express.Router();
const OfficerController = require("../controllers/officerController");
const Authentication = require("../middleware/authentications");
const checkRole = require("../middleware/authorization");

router.get(
  "/users",
  Authentication,
  checkRole("officer", "admin"),
  OfficerController.getUsers
);

router.post(
  "/applications",
  Authentication,
  checkRole("officer", "admin"),
  OfficerController.createApplication
);

router.get(
  "/applications",
  Authentication,
  checkRole("officer", "admin"),
  OfficerController.getApplications
);

router.get(
  "/applications/:id",
  Authentication,
  checkRole("officer", "admin"),
  OfficerController.getApplicationDetail
);

router.get(
  "/applications/:id/report",
  Authentication,
  checkRole("officer", "admin"),
  OfficerController.getApplicationReport
);

router.put(
  "/applications/:id",
  Authentication,
  checkRole("officer", "admin"),
  OfficerController.updateApplication
);

router.delete(
  "/applications/:id",
  Authentication,
  checkRole("officer", "admin"),
  OfficerController.deleteApplication
);

module.exports = router;
