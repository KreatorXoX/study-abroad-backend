const express = require("express");
const applicationController = require("../controllers/applicationController");
const router = express.Router();

router
  .route("/")
  .get(applicationController.getAllApplications)
  .post(applicationController.createNewApplication)
  .patch(applicationController.updateApplication)
  .delete(applicationController.deleteApplication);
router.route("/:id").get(applicationController.getApplicationByStudent);

module.exports = router;
