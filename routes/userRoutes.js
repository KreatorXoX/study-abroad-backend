const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createNewUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
router.route("/user/:id").get(userController.getUserById);
router.route("/:role").get(userController.getUserByRole);

module.exports = router;
