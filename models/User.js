const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["employee", "admin", "user"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  assignedStudents: {
    type: [Schema.Types.ObjectId],
    default: () => {
      return undefined;
    },
    ref: "User",
  },
  assignedConsultants: {
    type: [Schema.Types.ObjectId],
    default: () => {
      return undefined;
    },
    ref: "User",
  },
  tasks: {
    type: [Schema.Types.ObjectId],
    default: () => {
      return undefined;
    },
    ref: "Task",
  },
  applications: {
    type: [Schema.Types.ObjectId],
    default: () => {
      return undefined;
    },
    ref: "Application",
  },
});

module.exports = mongoose.model("User", userSchema);
