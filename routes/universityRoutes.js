const express = require("express");
const { check } = require("express-validator");
const universityController = require("../controllers/universityController");
const verifyAuth = require("../middleware/verifyAuth");

const router = express.Router();
const checkFields = [
  check("name").isString().isLength({ min: 3 }),
  check("logo").isURL(),
  check("generalInfo").isString().not().isEmpty(),
  check("motto").isString().not().isEmpty(),
  check("videoUrl").isURL(),
  check("infoBoxes.box1.*").isString().not().isEmpty(),
  check("infoBoxes.box2.*").isString().not().isEmpty(),
  check("infoBoxes.box3.*").isString().not().isEmpty(),
];
router
  .route("/")
  .get(universityController.getAllUniversities)
  .post(
    verifyAuth,
    [...checkFields, check("countryId").isMongoId()],
    universityController.createNewUniversity
  )
  .patch(
    [...checkFields, check("universityId").isMongoId()],
    universityController.updateUniversity
  )
  .delete(universityController.deleteUniversity);
router
  .route("/:id")
  .get([check("id").isMongoId()], universityController.getUniversityById);

module.exports = router;
