const mongoose = require("mongoose");

const updateSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Update = mongoose.model("updates", updateSchema);

module.exports = Update;
