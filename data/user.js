const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },

  displayName: {
    type: String,
  },
});

module.exports = mongoose.model("user", userDetailsSchema);