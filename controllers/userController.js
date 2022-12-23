const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { cloudinary } = require("../config/cloudinaryOptions");
const HttpError = require("../models/http-error");

const User = require("../models/User");
const Task = require("../models/Task");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});
const getUserById = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Id is required", ...errors });
  }
  const { id } = req.params;

  const user = await User.findById(id)
    .select("-password")
    .populate({
      path: "assignedConsultants",
      select: ["username"],
    })
    .populate({
      path: "assignedStudents",
      select: ["username", "image"],
    })
    .lean()
    .exec();

  if (!user) {
    return res.status(400).json({ message: "No user found with the given Id" });
  }

  res.json(user);
});
const getUsersByRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid Role", ...errors });
  }
  const { role } = req.params;

  const users = await User.find({ role: role })
    .select("-password")
    .lean()
    .exec();

  if (!users?.length) {
    return res
      .status(400)
      .json({ message: "No users found with the given role", role });
  }

  res.json(users);
});
const createNewUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Validation Error", 400));
  }
  const { username, email, password, role } = req.body;
  const duplicateUser = await User.findOne({ email }).lean().exec(); // documentation says if you pass params you should add exec for returning promises

  if (duplicateUser) {
    return next(new HttpError("Duplicate User !", 409));
  }

  let userImage = undefined;
  if (req.file) {
    userImage = { url: req.file.path, filename: req.file.filename };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = {
    username,
    email,
    password: hashedPassword,
    role,
    image: userImage,
    assignedStudents: [],
    tasks: [],
  };

  const newUser = await User.create(userObject);

  if (newUser) {
    res.status(201).json({ message: `User ${username} created successfully` });
  } else {
    return next(new HttpError("Failed to Create User", 500));
  }
});

const updateUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Validation Error", 409));
  }

  const { id, email, active, password, username } = req.body;

  const user = await User.findById(id).exec();

  if (!user) {
    return next(new HttpError("User Does not Exist!", 404));
  }

  const duplicateUser = await User.findOne({ email }).lean().exec();

  // if the user tries to update their email to an existing email
  if (duplicateUser && duplicateUser._id.toString() !== id) {
    return next(new HttpError("Duplicate User !", 409));
  }

  user.username = username;
  user.email = email;
  user.active = active;

  if (req.file) {
    const userImage = { url: req.file.path, filename: req.file.filename };
    if (user.image?.filename) {
      cloudinary.uploader.destroy(user.image.filename);
    }
    user.image = userImage;
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }
  await user.save();

  res.json({ message: `${user.username} is updated`, id: user._id });
});

const deleteUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }

  const { id, role } = req.body;
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

  cloudinary.uploader.destroy(result.image?.filename);

  const message = `User:${result.username} deleted successfully`;

  res.json({ message, role: role, id: id });
});

const assignUsers = asyncHandler(async (req, res) => {
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
  ).exec();

  if (!std) {
    return res
      .status(400)
      .json({ message: "No student found with the given id" });
  }

  const emps = await User.updateMany(
    { _id: { $in: consultIds } },
    { $addToSet: { assignedStudents: stdId } },
    { session: updateSession }
  ).exec();

  if (!emps || emps.matchedCount !== consultIds.length) {
    return res.status(400).json({ message: "Failed to match Consult Ids" });
  }

  await updateSession.commitTransaction();

  res.json({ message: "Successful assignment", stdId: stdId });
});

const deAssignUsers = asyncHandler(async (req, res) => {
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
  ).exec();

  await User.findByIdAndUpdate(
    consultId,
    {
      $pull: { assignedStudents: stdId },
    },
    { session: updateSession }
  ).exec();
  await updateSession.commitTransaction();

  res.json({ message: "Successful deassignment", stdId: stdId });
});

module.exports = {
  getAllUsers,
  getUserById,
  getUsersByRole,
  createNewUser,
  updateUser,
  deleteUser,
  assignUsers,
  deAssignUsers,
};
