const mongoose = require("mongoose");
const University = require("./University");
const Application = require("./Application");
const User = require("./User");
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
    const universityIds = country.universities;
    await University.deleteMany({
      _id: { $in: country.universities },
    }).exec();

    const apps = await Application.find({
      university: { $in: universityIds },
    }).exec();
    const applicationIds = apps.map((app) => app._id);
    await Application.deleteMany({ _id: { $in: applicationIds } }).exec();

    const users = await User.find({
      applications: { $in: applicationIds },
    }).exec();
    for (let user of users) {
      user.applications.pull(applicationIds);
      await user.save();
    }
  }
});
module.exports = mongoose.model("Country", countrySchema);
