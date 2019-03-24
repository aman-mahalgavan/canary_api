const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    maxlength: 20
  },
  intro: {
    type: String,
    required: true,
    maxlength: 40
  },
  about: {
    type: String,
    required: true
  },
  headerImage: {
    type: String,
    required: true
  },
  campaignAddress: {
    type: String,
    required: true
  },
  creatorAddress: {
    type: String,
    required: true
  },
  comments: [
    {
      userName: {
        type: String,
        required: true
      },
      avatar: {
        type: String,
        required: true
      },
      commentBody: {
        type: String,
        required: true
      }
    }
  ],
  updates: [
    {
      updateId: { type: mongoose.Schema.Types.ObjectId, required: true }
    }
  ]
});
