const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

router
  .route("/")
  .post(
    loginLimiter,
    [check("email").isEmail(), check("password").isLength({ min: 6 })],
    authController.login
  );

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

module.exports = router;
