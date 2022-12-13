const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");

const Application = require("../models/Application");
const User = require("../models/User");
const University = require("../models/University");

const getAllApplications = asyncHandler(async (req, res, next) => {
  const applications = await Application.find().lean();

  if (!applications?.length) {
    return res.status(400).json({ message: "No application found" });
  }

  res.json(applications);
});

const getApplicationsByStudent = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }

  const { id } = req.params;

  const user = await User.findById(id)
    .populate({
      path: "applications",
      populate: {
        path: "university",
        model: "University",
        select: ["logo", "name"],
      },
    })
    .lean()
    .exec();

  if (!user?.applications) {
    return res.status(404).json({ message: "No Applications Found" });
  }

  res.json(user.applications);
});
const getApplicationById = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }

  const { id } = req.params;

  const application = await Application.findById(id).lean().exec();

  if (!application) {
    return res
      .status(404)
      .json({ message: "Application not found for the given id" });
  }

  res.json(application);
});

const createNewApplication = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { stdId, universityId } = req.body;

  const duplicateApplication = await Application.findOne({
    $and: [{ user: stdId }, { university: universityId }],
  })
    .lean()
    .exec();

  if (duplicateApplication) {
    return res.status(400).json({ message: "Duplicate Application" });
  }

  const uni = await University.findById(universityId).lean().exec();

  if (!uni) {
    return res.status(400).json({ message: "University not found" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const applicationObject = { user: stdId, university: universityId };

  const newApplication = await Application.create([applicationObject], {
    session: session,
  });

  const std = await User.findByIdAndUpdate(
    stdId,
    { $push: { applications: newApplication } },
    { session: session }
  ).exec();
  if (!std) {
    return res.status(400).json({ message: "User not found" });
  }
  await session.commitTransaction();

  if (newApplication) {
    res
      .status(201)
      .json({ message: "Application created successfully", stdId: stdId });
  } else {
    res.status(400).json({
      message: "Failed to create application",
    });
  }
});
const updateApplication = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { appId, status } = req.body;

  const application = await Application.findById(appId).exec();

  if (!application) {
    return res.status(400).json({ message: "application not found" });
  }

  application.status = status;

  await application.save();
  res.json({
    message: "Application updated",
    stdId: application.user,
    id: appId,
  });
});
const deleteApplication = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { id } = req.body;

  const result = await Application.findByIdAndRemove(id).exec();

  if (!result) {
    return res
      .status(404)
      .json({ message: "No Application found with the given id" });
  }
  const response = `Application :${result._id} deleted successfully`;

  res.json({ message: response, stdId: result.user._id });
});

module.exports = {
  getAllApplications,
  getApplicationById,
  getApplicationsByStudent,
  createNewApplication,
  updateApplication,
  deleteApplication,
};
