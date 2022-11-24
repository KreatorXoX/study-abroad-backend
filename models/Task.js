const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    completed: {
      byStudent: {
        type: Boolean,
        default: false,
      },
      byEmployee: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
