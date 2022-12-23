const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const Country = require("../models/Country");
const University = require("../models/University");
const { cloudinary } = require("../config/cloudinaryOptions");

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
  const {
    name,
    generalInfo,
    motto,
    videoUrl,
    infoBox1Header,
    infoBox1Content,
    infoBox2Header,
    infoBox2Content,
    infoBox3Header,
    infoBox3Content,
    countryId,
  } = req.body;

  const country = await Country.findById(countryId).exec();

  if (!country) {
    return res.status(404).json({ message: "Country not found" });
  }

  const duplicateUniversity = await University.findOne({ name }).lean().exec();

  if (duplicateUniversity) {
    return res.status(409).json({ message: "Duplicate University" });
  }

  const universityImage = { url: req.file.path, filename: req.file.filename };

  const universityObject = {
    name,
    logo: universityImage,
    generalInfo,
    motto,
    videoUrl,
    infoBoxes: {
      box1: {
        header: infoBox1Header,
        content: infoBox1Content,
      },
      box2: {
        header: infoBox2Header,
        content: infoBox2Content,
      },
      box3: {
        header: infoBox3Header,
        content: infoBox3Content,
      },
    },
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
  const {
    name,
    generalInfo,
    motto,
    videoUrl,
    infoBox1Header,
    infoBox1Content,
    infoBox2Header,
    infoBox2Content,
    infoBox3Header,
    infoBox3Content,
    countryId,
    universityId,
  } = req.body;

  const university = await University.findById(universityId).exec();

  if (!university) {
    return res.status(400).json({ message: "university not found" });
  }

  university.name = name ? name : university.name;
  university.country = countryId ? countryId : university.country;
  university.generalInfo = generalInfo ? generalInfo : university.generalInfo;
  university.motto = motto ? motto : university.motto;
  university.videoUrl = videoUrl ? videoUrl : university.videoUrl;
  university.infoBoxes = {
    box1: {
      header: infoBox1Header
        ? infoBox1Header
        : university.infoBoxes.box1.header,
      content: infoBox1Content
        ? infoBox1Content
        : university.infoBoxes.box1.content,
    },
    box2: {
      header: infoBox2Header
        ? infoBox2Header
        : university.infoBoxes.box2.header,
      content: infoBox2Content
        ? infoBox2Content
        : university.infoBoxes.box2.content,
    },
    box3: {
      header: infoBox3Header
        ? infoBox3Header
        : university.infoBoxes.box3.header,
      content: infoBox3Content
        ? infoBox3Content
        : university.infoBoxes.box3.content,
    },
  };

  if (req.file) {
    const universityImage = { url: req.file.path, filename: req.file.filename };
    if (university.logo?.filename) {
      cloudinary.uploader.destroy(university.logo.filename);
    }
    university.logo = universityImage;
  }

  await university.save();

  res.json({ message: "University updated", id: university._id });
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

  if (result.logo?.filename) {
    cloudinary.uploader.destroy(result.logo.filename);
  }

  const message = `University : ${result.name} deleted successfully`;

  res.json({ message });
});

module.exports = {
  getAllUniversities,
  createNewUniversity,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
};
