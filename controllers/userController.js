const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Task = require("../models/Task");
const asyncHandler = require("express-async-handler");

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});
const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }

  const user = await User.findById(id).lean().exec();

  if (!user) {
    return res.status(400).json({ message: "No user found with the given Id" });
  }

  res.json(user);
});
const getUserByRole = asyncHandler(async (req, res, next) => {
  const { role } = req.params;

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  const user = await User.find({ role: role }).lean().exec();

  if (!user || user.length < 1) {
    return res
      .status(400)
      .json({ message: "No user found with the given role" });
  }

  res.json(user);
});
const createNewUser = asyncHandler(async (req, res, next) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Fields are required" });
  }

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
  const { id, username, role, active, password } = req.body;

  if (!id || !username || !role || typeof active !== "boolean") {
    return res
      .status(400)
      .json({ message: "Id, username, role and active are required" });
  }

  const user = await User.findById(id).exec(); // because we are going to edit/update the user we don't call lean method here.

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
  user.role = role;
  user.active = active;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }
  await user.save();

  res.json({ message: `${user.username} is updated` });
});
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const task = await Task.findOne({ users: { $in: id } }).lean();

  if (task) {
    return res.status(400).json({ message: "User still has existing task" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const response = `Username:${result.username} with ID:${result._id} deleted successfully}`;

  res.json(response);
});
const assignUsers = asyncHandler(async (req, res, next) => {
  const { stdId, consultIds } = req.body;

  if (!stdId || !consultIds) {
    return res.status(400).json({ message: "Fields are required" });
  }

  const updateSession = await mongoose.startSession();
  updateSession.startTransaction();
  await User.findByIdAndUpdate(
    stdId,
    {
      $addToSet: { assignedConsultants: consultIds },
    },
    { session: updateSession }
  );

  await User.updateMany(
    { _id: { $in: consultIds } },
    { $addToSet: { assignedStudents: stdId } },
    { session: updateSession }
  );

  await updateSession.commitTransaction();

  res.json({ message: "Successful assignment" });
});
const deAssignUsers = asyncHandler(async (req, res, next) => {
  const { stdId, consultId } = req.body;

  if (!stdId || !consultId) {
    return res.status(400).json({ message: "Fields are required zzz" });
  }

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

const test = asyncHandler(async (req, res) => {
  const { stdid } = req.body;
  const student = await User.findById(stdid).populate("assignedConsultants");

  res.json(student);
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
  test,
};
