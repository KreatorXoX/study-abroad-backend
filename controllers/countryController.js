const Country = require("../models/Country");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");

const getAllCountries = asyncHandler(async (req, res, next) => {
  const countries = await Country.find().lean();

  if (!countries?.length) {
    return res.status(400).json({ message: "No country found" });
  }

  res.json(countries);
});

const getCountryById = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { id } = req.params;

  const country = await Country.findById(id).lean().exec();

  if (!country) {
    return res.status(404).json({ message: "Country not found" });
  }

  res.json(country);
});

const createNewCountry = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { name, flag, videoUrl } = req.body;
  const duplicateCountry = await Country.findOne({ name }).lean().exec();
  if (duplicateCountry) {
    return res.status(400).json({ message: "Duplicated Country" });
  }
  const countryObject = { name, flag, videoUrl };

  const newCountry = await Country.create(countryObject);

  if (newCountry) {
    res.status(201).json({ message: "Country created successfully" });
  } else {
    res.status(400).json({
      message: "Failed to create country",
    });
  }
});
const updateCountry = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { cid, name, flag, videoUrl } = req.body;

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
const deleteCountry = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Fields are required", ...errors });
  }
  const { id } = req.body;

  const result = await Country.findByIdAndRemove(id).exec();

  if (!result) {
    return res.status(400).json({ message: "Country not found" });
  }

  const response = `Country : ${result.name} deleted successfully`;

  res.json({ message: response });
});

module.exports = {
  getAllCountries,
  createNewCountry,
  getCountryById,
  updateCountry,
  deleteCountry,
};
