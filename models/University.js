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

module.exports = mongoose.model("University", universitySchema);
