const mongoose = require("mongoose");
const User = require("./User");

let faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
});

let Faq = mongoose.model("faqs", faqSchema);
module.exports = Faq;
