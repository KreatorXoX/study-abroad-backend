const express = require("express");
const universityController = require("../controllers/universityController");
const router = express.Router();

router
  .route("/")
  .get(universityController.getAllUniversities)
  .post(universityController.createNewUniversity)
  .patch(universityController.updateUniversity)
  .delete(universityController.deleteUniversity);
router.route("/:id").get(universityController.getUniversityById);

module.exports = router;
