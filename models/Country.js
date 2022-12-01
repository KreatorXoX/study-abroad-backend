const mongoose = require("mongoose");
const University = require("./University");
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
  universities: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: "University",
  },
});

countrySchema.post("findOneAndRemove", async function (country) {
  if (country) {
    await University.deleteMany({
      _id: { $in: country.universities },
    });
  }
});
module.exports = mongoose.model("Country", countrySchema);
