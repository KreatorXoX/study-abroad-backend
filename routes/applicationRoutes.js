const express = require("express");
const { check } = require("express-validator");
const applicationController = require("../controllers/applicationController");
const router = express.Router();

router
  .route("/")
  .get(applicationController.getAllApplications)
  .post(
    [check("stdId").isMongoId(), check("universityId").isMongoId()],
    applicationController.createNewApplication
  )
  .patch(
    [
      check("appId").isMongoId(),
      check("status").isIn(["declined", "accepted"]),
    ],
    applicationController.updateApplication
  )
  .delete(applicationController.deleteApplication);
router
  .route("/:id")
  .get(
    [check("id").isMongoId()],
    applicationController.getApplicationByStudent
  );

module.exports = router;
