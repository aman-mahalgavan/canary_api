const mongoose = require("mongoose");
const User = require("./User");

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
    type: String,
    required: true
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

profileSchema.statics.findByAddress = function(address) {
  let Profile = this;
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findOne({ address });
      if (!user) {
        return reject("No User Found with the given Ethereum address");
      }

      let userProfile = await Profile.findOne({ user: user._id });

      // console.log(user);
      // console.log(userProfile);
      if (!userProfile) {
        return reject("No Profile found");
      }

      return resolve(userProfile);
    } catch (err) {
      return reject(err.message);
    }
  });
};

let Profile = mongoose.model("profiles", profileSchema);

module.exports = Profile;
