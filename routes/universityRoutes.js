const express = require("express");
const { check } = require("express-validator");
const universityController = require("../controllers/universityController");
const verifyAuth = require("../middleware/verifyAuth");

const router = express.Router();
const checkFields = [
  check("name").isString().isLength({ min: 3 }),
  check("countryId").isMongoId(),
  check("generalInfo").isString().not().isEmpty(),
  check("logo").not().isEmpty(),
  check("motto").isString().not().isEmpty(),
  check("videoUrl").isURL(),
  check("infoBox1Header").isString().not().isEmpty(),
  check("infoBox1Content").isString().not().isEmpty(),
  check("infoBox2Header").isString().not().isEmpty(),
  check("infoBox2Content").isString().not().isEmpty(),
  check("infoBox3Header").isString().not().isEmpty(),
  check("infoBox3Content").isString().not().isEmpty(),
];
router
  .route("/")
  .get(universityController.getAllUniversities)
  .post(verifyAuth, [...checkFields], universityController.createNewUniversity)
  .patch(
    verifyAuth,
    [...checkFields, check("universityId").isMongoId()],
    universityController.updateUniversity
  )
  .delete(verifyAuth, universityController.deleteUniversity);
router
  .route("/:id")
  .get([check("id").isMongoId()], universityController.getUniversityById);

module.exports = router;
