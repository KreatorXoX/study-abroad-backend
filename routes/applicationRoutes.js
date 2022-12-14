const express = require("express");
const { check } = require("express-validator");
const applicationController = require("../controllers/applicationController");
const router = express.Router();
const verifyAuth = require("../middleware/verifyAuth");

router.use(verifyAuth);

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
  .route("/std/:id")
  .get(
    [check("id").isMongoId()],
    applicationController.getApplicationsByStudent
  );
router
  .route("/:id")
  .get([check("id").isMongoId()], applicationController.getApplicationById);

module.exports = router;
