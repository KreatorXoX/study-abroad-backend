const express = require("express");
const { check } = require("express-validator");
const upload = require("../config/multerOptions");
const universityController = require("../controllers/universityController");
const verifyAuth = require("../middleware/verifyAuth");

const mimeTypes = ["image/jpeg", "image/jpg", "image/png"];

const router = express.Router();
const checkFields = [
  check("name").isString().isLength({ min: 3 }),
  check("countryId").isMongoId(),
  check("generalInfo").isString().not().isEmpty(),
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
  .post(
    verifyAuth,
    upload.single("logo"),
    [
      ...checkFields,
      check("logo").custom((value, { req }) => {
        if (!req.file) {
          throw new Error("Image doesnt exist please try to reupload again");
        } else if (!mimeTypes.includes(req.file.mimetype)) {
          throw new Error("Image supported extensions are : jpeg,jpg,png");
        } else return true;
      }),
    ],
    universityController.createNewUniversity
  )
  .patch(
    verifyAuth,
    upload.single("logo"),
    [check("universityId").isMongoId()],
    universityController.updateUniversity
  )
  .delete(verifyAuth, universityController.deleteUniversity);
router
  .route("/:id")
  .get([check("id").isMongoId()], universityController.getUniversityById);

module.exports = router;
