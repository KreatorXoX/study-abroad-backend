const mongoose = require("mongoose");
const Application = require("../models/Application");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const getAllApplications = asyncHandler(async (req, res, next) => {
  const applications = await Application.find().lean();

  if (!applications?.length) {
    return res.status(400).json({ message: "No application found" });
  }

  res.json(applications);
});

const getApplicationByStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id field is required" });
  }

  const application = await Application.findById(id).lean().exec();

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json(application);
});

const createNewApplication = asyncHandler(async (req, res, next) => {
  const { stdId, universityId } = req.body;

  if (!stdId || !universityId) {
    return res.status(400).json({ message: "Fields are required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const applicationObject = { user: stdId, universities: universityId };

  const newApplication = await Application.create(applicationObject, {
    session: session,
  });

  await User.findByIdAndUpdate(
    stdId,
    { $push: { applications: newApplication } },
    { session: session }
  );

  await session.commitTransaction();

  if (newApplication) {
    res.status(201).json({ message: "Application created successfully" });
  } else {
    res.status(400).json({
      message: "Failed to create application",
    });
  }
});
const updateApplication = asyncHandler(async (req, res, next) => {
  const { appId, status } = req.body;

  if (!appId || !status) {
    return res.status(400).json({ message: "Fields are required" });
  }

  const application = await Application.findById(appId).exec();

  if (!application) {
    return res.status(400).json({ message: "application not found" });
  }

  application.status = status;

  await application.save();
  res.json({ message: "Application updated " });
});
const deleteApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Application ID is required" });
  }

  const application = await Application.findById(id).exec();

  if (!application) {
    return res.status(400).json({ message: "Application not found" });
  }

  const result = await application.deleteOne();

  const response = `Application :${result.name} deleted successfully}`;

  res.json({ message: response });
});

module.exports = {
  getAllApplications,
  createNewApplication,
  getApplicationByStudent,
  updateApplication,
  deleteApplication,
};
