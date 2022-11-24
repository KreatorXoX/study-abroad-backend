const express = require("express");
const taskController = require("../controllers/taskController");
const router = express.Router();

router
  .route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createNewTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);
module.exports = router;
