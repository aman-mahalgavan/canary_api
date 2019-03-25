// Requiring modules
const express = require("express");
const Campaign = require("../../Models/Campaign");
const User = require("../../Models/User");
const Profile = require("../../Models/Profile");
const { upload, bucket } = require("../../configure/image-upload-setup");
const uploadToGcs = require("../../utils/uploadToGcs");
const isEmpty = require("../../validation/is-empty");
const validateCampaignInputs = require("../../validation/campaign");
const passport = require("passport");

// Creating a router instance

const router = express.Router();

//<-------------------------------------Routes-------------------------------------------------------------->

// @route     POST /api/campaign/create
// @fnc       Creating a new Campaign
// @access    private

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  upload.single("campaignImage"),
  async (req, res) => {
    let { errors, isValid } = validateCampaignInputs(req.body, req.file);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json({ errors });
    }
    try {
      let user = await User.findById(req.user._id);

      // Fetching from user Model and Profile Model
      if (!user.address) {
        errors.message = "No Ethereum address is associated with this user";
        return res.status(400).json({ errors });
      }
      let userProfile = await Profile.findOne({ user: user._id });
      if (!userProfile) {
        errors.message = "No profile created for this user";
        return res.status(400).json({ errors });
      }

      // Creating a campignfield object involving the details of the campaign

      let campaignFields = {
        heading: req.body.heading,
        intro: req.body.intro,
        about: req.body.about,
        campaignAddress: req.body.campaignAddress,
        creatorAddress: user.address
      };
      campaignFields.headerImage = await uploadToGcs(req, bucket);

      // Creating and Saving the campaign to the mongodb database
      let newCampaign = new Campaign(campaignFields);
      let savedCampaign = await newCampaign.save();
      return res.json(savedCampaign);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json({ errors });
    }
  }
);

// @route     GET /api/campaign
// @fnc       Fetching all the campaigns
// @access    public

router.get("/", async (req, res) => {
  let errors = {};
  try {
    let campaigns = await Campaign.find().sort("-createdAT");
    if (!campaigns) {
      errors.message = "No Campaigns Found";
      res.status(400).json({ errors });
    }
    return res.json(campaigns);
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

// @route     GET /api/campaign/:address
// @fnc       Fetching a single campaign using campaign Address
// @access    public

router.get("/:address", async (req, res) => {
  let errors = {};

  try {
    let campaign = await Campaign.findOne({
      campaignAddress: req.params.address
    });
    if (!campaign) {
      errors.message = "No campaign found with the given address";
      res.status(400).json({ errors });
    }
    return res.json(campign);
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

module.exports = router;
