const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const applicationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    university: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "University",
    },

    status: {
      type: String,
      enum: ["pending", "declined", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.post("findOneAndRemove", async function (application) {
  if (application) {
    const populatedApplication = await application.populate("user");
    const user = populatedApplication.user;

    if (user.applications) {
      user.applications.pull(application);
      await user.save();
    }
  }
});

module.exports = mongoose.model("Application", applicationSchema);
