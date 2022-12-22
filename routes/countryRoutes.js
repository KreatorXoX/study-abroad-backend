const express = require("express");
const { check } = require("express-validator");
const countryController = require("../controllers/countryController");
const verifyAuth = require("../middleware/verifyAuth");
const upload = require("../config/multerOptions");
const router = express.Router();

const mimeTypes = ["image/jpeg", "image/jpg", "image/png"];

router
  .route("/")
  .get(countryController.getAllCountries)
  .post(
    verifyAuth,
    upload.single("flag"),
    [
      check("name").isString().not().isEmpty(),
      check("videoUrl").isURL(),
      check("flag").custom((value, { req }) => {
        if (!req.file) {
          return false;
        } else if (!mimeTypes.includes(req.file.mimetype)) {
          return false;
        } else return true;
      }),
    ],
    countryController.createNewCountry
  )
  .patch(
    verifyAuth,
    upload.single("flag"),
    [
      check("cid").isMongoId(),
      check("name").isString().not().isEmpty(),
      check("videoUrl").isURL(),
    ],
    countryController.updateCountry
  )
  .delete(
    verifyAuth,
    [check("id").isMongoId()],
    countryController.deleteCountry
  );
router
  .route("/:id")
  .get([check("id").isMongoId()], countryController.getCountryById);

module.exports = router;
