const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
heading: {
    type: String,
    required: true
  },
  intro: {
    type: String,
    required: true
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
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  comments: [
    {
      userName: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
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
      updateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "updates",
        required: true
      }
    }
  ],
  faq: [
    {
      faqId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faq",
        required: true
      }
    }
  ]
});

const Campaign = mongoose.model("campaigns", campaignSchema);

module.exports = Campaign;
