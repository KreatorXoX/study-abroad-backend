const express = require("express");
const { check } = require("express-validator");
const taskController = require("../controllers/taskController");
const router = express.Router();
const verifyAuth = require("../middleware/verifyAuth");
const verifyAdmin = require("../middleware/verifyAdmin");

router.use(verifyAuth);

router
  .route("/")
  .get(taskController.getAllTasks)
  .patch([check("taskId").isMongoId()], taskController.updateTask)
  .post(
    verifyAdmin,
    [
      check("empId").isMongoId(),
      check("stdId").isMongoId(),
      check("title").notEmpty(),
    ],
    taskController.createNewTask
  )
  .delete(verifyAdmin, [check("id").isMongoId()], taskController.deleteTask);

router
  .route("/:stdId")
  .get([check("stdId").isMongoId()], taskController.getTasksByStudent);
module.exports = router;
