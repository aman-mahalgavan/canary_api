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
  }
});

const Update = mongoose.model("updates", updateSchema);

module.exports = Update;
