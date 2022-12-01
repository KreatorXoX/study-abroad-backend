const mongoose = require("mongoose");
const Application = require("./Application");
const Task = require("./Task");
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

userSchema.post("findOneAndRemove", async function (user) {
  if (user) {
    if (user.role === "employee") {
      const populatedUser = await user.populate("assignedStudents");
      const students = populatedUser.assignedStudents;

      if (students && students.length > 0) {
        for (let student of students) {
          student.assignedConsultants.pull(user._id);
          await student.save();
        }
      }

      if (user.tasks) {
        for (let taskId of user.tasks) {
          await Task.findByIdAndRemove(taskId);
        }
      }
    } else if (user.role === "user") {
      const populatedUser = await user.populate("assignedConsultants");
      const consults = populatedUser.assignedConsultants;

      if (consults && consults.length > 0) {
        for (let consult of consults) {
          consult.assignedStudents.pull(user._id);
          await consult.save();
        }
      }
      if (user.tasks) {
        for (let taskId of user.tasks) {
          await Task.findByIdAndRemove(taskId);
        }
      }

      await Application.deleteMany({ _id: { $in: user.applications } });
    }
  }
});

module.exports = mongoose.model("User", userSchema);
