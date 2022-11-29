const express = require("express");
const taskController = require("../controllers/taskController");
const router = express.Router();

router
  .route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createNewTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

router.route("/:stdId").get(taskController.getTasksByStudent);
module.exports = router;
