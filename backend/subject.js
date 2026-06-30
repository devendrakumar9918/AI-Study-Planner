const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  email: String,
  subject: String,
  date: String,
  level: String,
  completed: {
     type: Boolean,
     default: false
  }
});

module.exports = mongoose.model("Subject", subjectSchema);