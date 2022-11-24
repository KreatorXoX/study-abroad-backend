const User = require("../models/User");
const Task = require("../models/Task");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
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

  const userObject = { username, password: hashedPassword, role };

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

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
