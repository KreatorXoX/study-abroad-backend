const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const applicationSchema = new Schema(
  {
    universities: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "University",
      },
    ],
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

module.exports = mongoose.model("Application", applicationSchema);