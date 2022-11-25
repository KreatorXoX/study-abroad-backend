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
  assignedStudents: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  assignedConsultants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
