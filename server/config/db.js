const mongoose = require("mongoose");

const connectDB = async () => {
  try {
      await mongoose.connect('mongodb://localhost/ParcelTrackerDB');
  } catch (err) {
      process.exit(1);  // exit program
  }
};

module.exports = connectDB;