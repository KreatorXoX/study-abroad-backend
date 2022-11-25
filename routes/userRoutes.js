const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router
  .route("/")
  .get(userController.getAllUsers)
  .get(userController.getUserById)
  .post(userController.createNewUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
