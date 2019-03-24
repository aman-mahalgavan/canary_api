const mongoose = require("mongoose");

let profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  handle: {
    type: String,
    required: true,
    max: 40
  },
  avatar: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  social: {
    facebook: {
      type: String
    },
    instagram: {
      type: String
    },
    twitter: {
      type: String
    },
    youtube: {
      type: String
    }
  },
  campaigns: [
    {
      campaignAddress: {
        type: String,
        required: true
      },
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    }
  ],
  contributions: [
    {
      campaignAddress: {
        type: String,
        required: true
      },
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    }
  ]
});

let Profile = mongoose.model("profiles", profileSchema);

module.exports = Profile;
