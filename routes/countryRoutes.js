const express = require("express");
const countryController = require("../controllers/countryController");
const router = express.Router();

router
  .route("/")
  .get(countryController.getAllCountries)
  .post(countryController.createNewCountry)
  .patch(countryController.updateCountry)
  .delete(countryController.deleteCountry);
router.route("/:id").get(countryController.getCountryById);

module.exports = router;
