const Country = require("../models/Country");
const asyncHandler = require("express-async-handler");

const getAllCountries = asyncHandler(async (req, res, next) => {
  const countries = await Country.find().lean();

  if (!countries?.length) {
    return res.status(400).json({ message: "No country found" });
  }

  res.json(countries);
});

const getCountryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id field is required" });
  }

  const country = await Country.findById(id).lean().exec();

  if (!country) {
    return res.status(404).json({ message: "Country not found" });
  }

  res.json(country);
});

const createNewCountry = asyncHandler(async (req, res, next) => {
  const { name, flag, videoUrl } = req.body;

  if (!name || !flag || !videoUrl) {
    return res.status(400).json({ message: "Fields are required" });
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
const deleteCountry = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Country ID is required" });
  }

  const country = await Country.findById(id).exec();

  if (!country) {
    return res.status(400).json({ message: "Country not found" });
  }

  const result = await country.deleteOne();

  const response = `Country :${result.name} deleted successfully}`;

  res.json({ message: response });
});

module.exports = {
  getAllCountries,
  createNewCountry,
  getCountryById,
  updateCountry,
  deleteCountry,
};
