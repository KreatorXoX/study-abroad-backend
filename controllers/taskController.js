const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Id is required", ...errors });
  }
  const { stdId } = req.params;

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { empId, title, description, stdId } = req.body;

  const taskObject = { users: [empId, stdId], title, description };

  const session = await mongoose.startSession();
  session.startTransaction();

  const newTask = await Task.create([taskObject], { session: session });

  const emp = await User.findByIdAndUpdate(
    empId,
    {
      $push: { tasks: newTask },
    },
    { session: session }
  ).exec();

  if (!emp) {
    return res
      .status(404)
      .json({ message: "No employee found with the given id" });
  }
  const std = await User.findByIdAndUpdate(
    stdId,
    {
      $push: { tasks: newTask },
    },
    { session: session }
  ).exec();
  if (!std) {
    return res
      .status(404)
      .json({ message: "No student found with the given id" });
  }
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { taskId, empCheck, stdCheck } = req.body;

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Id is required", ...errors });
  }
  const { id } = req.body;

  const result = await Task.findByIdAndRemove(id).exec();

  if (!result) {
    return res.status(400).json({ message: "Task not found" });
  }

  const response = `Task:${result.title} with ID:${result._id} deleted successfully`;

  res.json({ message: response });
});

module.exports = {
  getAllTasks,
  getTasksByStudent,
  createNewTask,
  updateTask,
  deleteTask,
};
