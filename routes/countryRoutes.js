const express = require("express");
const { check } = require("express-validator");
const countryController = require("../controllers/countryController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router
  .route("/")
  .get(countryController.getAllCountries)
  .post(
    upload.single("flag"),
    [
      check("name").isString().not().isEmpty(),
      check("flag").not().isEmpty(),
      check("videoUrl").isURL(),
    ],
    countryController.createNewCountry
  )
  .patch(
    [
      check("cid").isMongoId(),
      // check("name").isString().not().isEmpty(),
      // check("flag").isURL(),
      // check("videoUrl").isURL(),
    ],
    countryController.updateCountry
  )
  .delete([check("id").isMongoId()], countryController.deleteCountry);
router
  .route("/:id")
  .get([check("id").isMongoId()], countryController.getCountryById);

module.exports = router;
