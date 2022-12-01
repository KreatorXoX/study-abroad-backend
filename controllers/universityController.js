const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const Country = require("../models/Country");
const University = require("../models/University");

const getAllUniversities = asyncHandler(async (req, res, next) => {
  const universities = await University.find().lean();

  if (!universities?.length) {
    return res.status(400).json({ message: "No university found" });
  }

  res.json(universities);
});

const getUniversityById = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Id is required", ...errors });
  }
  const { id } = req.params;

  const university = await University.findById(id).lean().exec();

  if (!university) {
    return res.status(404).json({ message: "University not found" });
  }

  res.json(university);
});

const createNewUniversity = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { name, logo, generalInfo, motto, videoUrl, infoBoxes, countryId } =
    req.body;

  const country = await Country.findById(countryId);

  if (!country) {
    return res.status(404).json({ message: "Country not found" });
  }

  const duplicateUniversity = await University.findOne({ name }).lean().exec();

  if (duplicateUniversity) {
    return res.status(409).json({ message: "Duplicate University" });
  }

  const universityObject = {
    name,
    logo,
    generalInfo,
    motto,
    videoUrl,
    infoBoxes,
    country: countryId,
  };

  const updateSession = await mongoose.startSession();
  updateSession.startTransaction();

  const newUniversity = await University.create([universityObject], {
    session: updateSession,
  });

  country.universities.push(newUniversity[0]._id);

  await country.save({ session: updateSession });
  await updateSession.commitTransaction();

  if (newUniversity) {
    res.status(201).json({ message: "University created successfully" });
  } else {
    res.status(400).json({
      message: "Failed to create university",
    });
  }
});
const updateUniversity = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { universityId, name, logo, generalInfo, motto, videoUrl, infoBoxes } =
    req.body;

  const university = await University.findById(universityId).exec();

  if (!university) {
    return res.status(400).json({ message: "university not found" });
  }

  university.name = name;
  university.logo = logo;
  university.generalInfo = generalInfo;
  university.motto = motto;
  university.videoUrl = videoUrl;
  university.infoBoxes = infoBoxes;
  await university.save();

  res.json({ message: "University updated " });
});
const deleteUniversity = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Id is required", ...errors });
  }

  const { id } = req.body;

  const result = await University.findByIdAndRemove(id).exec();

  if (!result) {
    return res.status(400).json({ message: "University not found" });
  }

  const response = `University : ${result.name} deleted successfully`;

  res.json({ message: response });
});

module.exports = {
  getAllUniversities,
  createNewUniversity,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
};
