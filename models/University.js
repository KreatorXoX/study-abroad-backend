const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const universitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  generalInfo: {
    type: String,
    required: true,
  },
  motto: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  infoBoxes: {
    box1: {
      header: { type: String, required: true },
      content: { type: String, required: true },
    },
    box2: {
      header: { type: String, required: true },
      content: { type: String, required: true },
    },
    box3: {
      header: { type: String, required: true },
      content: { type: String, required: true },
    },
  },
  country: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Country",
  },
});

universitySchema.post("findOneAndRemove", async function (uni) {
  if (uni) {
    // need to change the logic like this because mongoose circular dependency error.
    const uniWithCountry = await uni.populate("country");
    const country = uniWithCountry.country;

    country.universities.pull(uni._id);
    await country.save();
  }
});

module.exports = mongoose.model("University", universitySchema);
