const express = require("express");
const { check } = require("express-validator");
const taskController = require("../controllers/taskController");

const router = express.Router();

router
  .route("/")
  .get(taskController.getAllTasks)
  .post(
    [
      check("empId").isMongoId(),
      check("stdId").isMongoId(),
      check("title").notEmpty(),
    ],
    taskController.createNewTask
  )
  .patch([check("taskId").isMongoId()], taskController.updateTask)
  .delete([check("id").isMongoId()], taskController.deleteTask);

router
  .route("/:stdId")
  .get([check("stdId").isMongoId()], taskController.getTasksByStudent);
module.exports = router;
