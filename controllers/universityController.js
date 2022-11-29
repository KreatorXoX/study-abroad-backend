const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Country = require("../models/Country");
const University = require("../models/University");

const getAllUniversities = asyncHandler(async (req, res, next) => {
  const universities = await Country.find().lean();

  if (!universities?.length) {
    return res.status(400).json({ message: "No university found" });
  }

  res.json(universities);
});

const getUniversityById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id field is required" });
  }

  const university = await University.findById(id).lean().exec();

  if (!university) {
    return res.status(404).json({ message: "University not found" });
  }

  res.json(university);
});

const createNewUniversity = asyncHandler(async (req, res, next) => {
  const { name, logo, generalInfo, motto, videoUrl, infoBoxes, countryId } =
    req.body;

  if (
    !name ||
    !logo ||
    generalInfo ||
    !motto ||
    !videoUrl ||
    infoBoxes ||
    !countryId
  ) {
    return res.status(400).json({ message: "Fields are required" });
  }

  const country = await Country.findById(countryId);

  if (!country) {
    return res.status(404).json({ message: "Country not found" });
  }

  const universityObject = {
    name,
    logo,
    generalInfo,
    motto,
    videoUrl,
    infoBoxes,
    countryId,
  };

  const updateSession = await mongoose.startSession();
  updateSession.startTransaction();

  const newUniversity = await University.create(universityObject, {
    session: updateSession,
  });

  country.universities.push(newUniversity);

  await country.save();
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
  const { cid, name, flag, videoUrl } = req.body;

  if (!cid) {
    return res.status(400).json({ message: "Country Id field is required" });
  }

  const country = await Country.findById(cid).exec();

  if (!country) {
    return res.status(400).json({ message: "Country not found" });
  }

  country.name = name ? name : country.name;
  country.flag = flag ? flag : country.flag;
  country.videoUrl = videoUrl ? videoUrl : country.videoUrl;
  await country.save();
  res.json({ message: "Country updated " });
});
const deleteUniversity = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "University ID is required" });
  }

  const university = await University.findById(id).exec();

  if (!university) {
    return res.status(400).json({ message: "University not found" });
  }

  const result = await university.deleteOne();

  const response = `University :${result.name} deleted successfully}`;

  res.json({ message: response });
});

module.exports = {
  getAllUniversities,
  createNewUniversity,
  getUniversityById,

  updateUniversity,
  deleteUniversity,
};
