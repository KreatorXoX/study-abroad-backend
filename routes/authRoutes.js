const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const upload = require("../config/multerOptions");
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

router
  .route("/register")
  .post(
    upload.single("image"),
    [
      check("email").isEmail(),
      check("username").not().isEmpty(),
      check("password").isLength({ min: 6 }),
    ],
    authController.register
  );

router
  .route("/login")
  .post(
    loginLimiter,
    [check("email").isEmail(), check("password").isLength({ min: 6 })],
    authController.login
  );

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

module.exports = router;
