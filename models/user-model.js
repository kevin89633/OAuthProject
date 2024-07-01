const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  googleID: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  thumbnail: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    minLength: 8,
    maxLength: 100,
  },
});

module.exports = mongoose.model("User", userSchema);
