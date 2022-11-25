const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const countrySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  flag: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  universities: [
    {
      type: Schema.Types.ObjectId,
      ref: "University",
    },
  ],
});

module.exports = mongoose.model("Country", countrySchema);
