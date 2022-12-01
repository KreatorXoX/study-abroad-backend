const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const User = require("../models/User");
const Task = require("../models/Task");

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});
const getUserById = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Id is required", ...errors });
  }
  const { id } = req.params;

  const user = await User.findById(id).select("-password").lean().exec();

  if (!user) {
    return res.status(400).json({ message: "No user found with the given Id" });
  }

  res.json(user);
});
const getUserByRole = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid Role", ...errors });
  }
  const { role } = req.params;

  const user = await User.find({ role: role })
    .select("-password")
    .lean()
    .exec();

  if (!user?.length) {
    return res
      .status(400)
      .json({ message: "No user found with the given role" });
  }

  res.json(user);
});
const createNewUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { username, password, role } = req.body;
  const duplicateUser = await User.findOne({ username }).lean().exec(); // documentation says if you pass params you should add exec for returning promises

  if (duplicateUser) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = {
    username,
    password: hashedPassword,
    role,
  };

  const newUser = await User.create(userObject);

  if (newUser) {
    res.status(201).json({ message: `User ${username} created successfully` });
  } else {
    res.status(400).json({
      message:
        "Failed to create user due to invalid data || something else went wrong with Model.create method",
    });
  }
});
const updateUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }

  const { id, username, active, password } = req.body;

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const duplicateUser = await User.findOne({ username: username })
    .lean()
    .exec();

  // if the user tries to update their username to an existing username
  if (duplicateUser && duplicateUser._id.toString() !== id) {
    return res.status(409).json({ message: "Username already in use" });
  }

  user.username = username;
  user.active = active;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }
  await user.save();

  res.json({ message: `${user.username} is updated` });
});
const deleteUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }

  const { id } = req.body;

  const task = await Task.findOne({ users: { $in: id } })
    .lean()
    .exec();

  if (task && (!task.completed.byEmployee || !task.completed.byStudent)) {
    return res.status(400).json({ message: "User still has uncompleted task" });
  }
  const result = await User.findByIdAndRemove(id).exec();

  if (!result) {
    return res.status(400).json({ message: "User not found" });
  }
  const response = `Username:${result.username} with ID:${result._id} deleted successfully`;

  res.json(response);
});
const assignUsers = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }

  const { stdId, consultIds } = req.body;

  const updateSession = await mongoose.startSession();
  updateSession.startTransaction();
  const std = await User.findByIdAndUpdate(
    stdId,
    {
      $addToSet: { assignedConsultants: consultIds },
    },
    { session: updateSession }
  );

  if (!std) {
    return res
      .status(400)
      .json({ message: "No student found with the given id" });
  }

  const emps = await User.updateMany(
    { _id: { $in: consultIds } },
    { $addToSet: { assignedStudents: stdId } },
    { session: updateSession }
  );

  if (!emps || emps.matchedCount !== consultIds.length) {
    return res.status(400).json({ message: "Failed to match Consult Ids" });
  }

  await updateSession.commitTransaction();

  res.json({ message: "Successful assignment" });
});
const deAssignUsers = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { stdId, consultId } = req.body;

  const updateSession = await mongoose.startSession();
  updateSession.startTransaction();
  await User.findByIdAndUpdate(
    stdId,
    {
      $pull: { assignedConsultants: consultId },
    },
    { session: updateSession }
  );

  await User.findByIdAndUpdate(
    consultId,
    {
      $pull: { assignedStudents: stdId },
    },
    { session: updateSession }
  );
  await updateSession.commitTransaction();

  res.json({ message: "Successful deassignment" });
});

module.exports = {
  getAllUsers,
  getUserById,
  getUserByRole,
  createNewUser,
  updateUser,
  deleteUser,
  assignUsers,
  deAssignUsers,
};
