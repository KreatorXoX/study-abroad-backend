const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const User = require("../models/User");

const getAllTasks = asyncHandler(async (req, res, next) => {
  const tasks = await Task.find().lean();

  if (!tasks?.length) {
    return res.status(400).json({ message: "No tasks found" });
  }

  res.json(tasks);
});
const getTasksByStudent = asyncHandler(async (req, res, next) => {
  const { stdId } = req.params;

  if (!stdId) {
    return res.status(400).json({ message: "Student-ID is required" });
  }

  const tasks = await Task.find({ users: { $in: stdId } })
    .lean()
    .exec();

  if (!tasks?.length) {
    return res
      .status(400)
      .json({ message: "No tasks found by the given student-id" });
  }

  res.json(tasks);
});
const createNewTask = asyncHandler(async (req, res, next) => {
  const { empId, title, description, stdId } = req.body;

  if (!empId || !stdId || !title || !description) {
    return res.status(400).json({ message: "Fields are required" });
  }

  const taskObject = { users: [empId, stdId], title, description };

  const newTask = await Task.create(taskObject);

  const session = await mongoose.startSession();
  session.startTransaction();

  await User.findByIdAndUpdate(
    empId,
    {
      $addToSet: { tasks: newTask },
    },
    { session: session }
  );
  await User.findByIdAndUpdate(
    stdId,
    {
      $addToSet: { tasks: newTask },
    },
    { session: session }
  );
  await session.commitTransaction();

  if (newTask) {
    res.status(201).json({ message: `Task created for ${stdId} by ${empId}` });
  } else {
    res.status(400).json({
      message: "Failed to create task",
    });
  }
});
const updateTask = asyncHandler(async (req, res, next) => {
  const { taskId, empCheck, stdCheck } = req.body;

  if (
    !taskId ||
    typeof empCheck !== "boolean" ||
    typeof stdCheck !== "boolean"
  ) {
    return res.status(400).json({ message: "Check field is required" });
  }

  const task = await Task.findById(taskId).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  task.completed.byStudent = stdCheck;
  task.completed.byEmployee = empCheck;

  await task.save();

  res.json({ message: `${task.title} with id ${taskId} is updated` });
});
const deleteTask = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Task ID is required" });
  }

  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "Task not found" });
  }

  const result = await task.deleteOne();

  const response = `Task:${result.title} with ID:${result._id} deleted successfully}`;

  res.json({ message: response });
});

module.exports = {
  getAllTasks,
  getTasksByStudent,
  createNewTask,
  updateTask,
  deleteTask,
};
