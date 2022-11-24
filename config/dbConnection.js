const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = connectDB;
