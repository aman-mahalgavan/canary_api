// Requiring modules
const express = require("express");
const Campaign = require("../../Models/Campaign");
const User = require("../../Models/User");
const Profile = require("../../Models/Profile");
const Update = require("../../Models/Updates");
const Faq = require("../../Models/Faq");
const { upload, bucket } = require("../../configure/image-upload-setup");
const uploadToGcs = require("../../utils/uploadToGcs");
const isEmpty = require("../../validation/is-empty");
const validateCampaignInputs = require("../../validation/campaign");
const passport = require("passport");
const { searchElementInArray } = require("../../utils/arrayUtils");

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

      // Creating and Saving the campaign to the Campaign Model
      let newCampaign = new Campaign(campaignFields);
      let savedCampaign = await newCampaign.save();

      // Saving the campaign details in Profile Model
      let campaignObject = {
        campaignAddress: savedCampaign.campaignAddress,
        campaignId: savedCampaign._id
      };
      userProfile.campaigns.push(campaignObject);
      await userProfile.save();
      
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
    return res.json(campaign);
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

// @route     POST /api/campaign/contribute
// @fnc       Contributimg to  a  Campaign
// @access    private

router.post(
  "/contribute",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let errors = {};
    try {
      let campaign = await Campaign.findOne({
        campaignAddress: req.body.address
      });

      // Checking if the required campaign and userProfile exist
      if (!campaign) {
        errors.message = "No Campaign with this address found";
        return res.status(400).json({ errors });
      }
      let userProfile = await Profile.findOne({ user: req.user._id });
      if (!userProfile) {
        errors.message = "User has not created his profile";
        return res.status(400).json({ errors });
      }

      // Creating a contribution object based on Profile model
      let contributionObject = {
        campaignAddress: campaign.campaignAddress,
        campaignId: campaign._id
      };

      if (
        !searchElementInArray(
          userProfile.contributions,
          contributionObject.campaignAddress
        )
      ) {
        // Adding and updating the contribution section of Profile model
        userProfile.contributions.push(contributionObject);
        let savedProfile = await userProfile.save();
        return res.json(savedProfile);
      }
      return res.json(userProfile);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json({ errors });
    }
  }
);

// @route     POST /api/campaign/comment
// @fnc       Commenting on a campaign
// @access    private

router.post(
  "/comment",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let errors = {};
    try {
      let campaign = await Campaign.findOne({
        campaignAddress: req.body.address
      });

      // Checking if the required campaign and userProfile exist
      if (!campaign) {
        errors.message = "No Campaign with this address found";
        return res.status(400).json({ errors });
      }
      let userProfile = await Profile.findOne({ user: req.user._id });
      if (!userProfile) {
        errors.message = "User has not created his profile";
        return res.status(400).json({ errors });
      }
      let commentFields = {
        userName: req.user.name,
        user: req.user._id,
        avatar: userProfile.avatar,
        commentBody: req.body.comment
      };

      campaign.comments.push(commentFields);
      let updatedCampaign = await campaign.save();
      return res.json(updatedCampaign);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json({ errors });
    }
  }
);

// @route     POST /api/campaign/update
// @fnc       Add an Update
// @access    private

router.post(
  "/update",
  passport.authenticate("jwt", { session: false }),
  upload.single("updateImage"),
  async (req, res) => {
    let errors = {};
    try {
      let campaign = await Campaign.findOne({
        campaignAddress: req.body.address
      });
      if (!campaign) {
        errors.address = "No Campaign found with the provided Campaign address";
        return res.status(400).json({ errors });
      }

      if (campaign.creatorAddress !== req.user.address) {
        errors.address = "Only the creator can add updates to a campaign";
        return res.status(400).json({ errors });
      }
      // Creating updateFields
      let updateFields = {
        heading: req.body.heading,
        details: req.body.details
      };
      updateFields.image = await uploadToGcs(req, bucket);

      // creating and saving to the Update collection
      let newUpdate = new Update(updateFields);
      let savedUpdate = await newUpdate.save();

      // Updating the respective Campaign collection
      campaign.updates.push({ updateId: savedUpdate._id });
      let updatedCampaign = await campaign.save();
      return res.json(updatedCampaign);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json({ errors });
    }
  }
);

// @route     GET /api/campaign/update/:id
// @fnc       Fetch a Single update through object id
// @access    public

router.get("/update/:id", async (req, res) => {
  let errors = {};
  try {
    let update = await Update.findById(req.params.id);
    if (!update) {
      errors.message = "No update with the given id found";
      return res.status(400).json({ errors });
    }
    return res.json(update);
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

// @route     POST /api/campaign/question
// @fnc       Ask a Question to the campaign creator
// @access    private

router.post(
  "/question",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let errors = {};
    try {
      let campaign = await Campaign.findOne({
        campaignAddress: req.body.address
      });
      if (!campaign) {
        errors.message = "No campaign with the given address found";
        return res.status(400).json({ errors });
      }
      let newFaq = new Faq({
        question: req.body.question
      });
      let savedFaq = await newFaq.save();
      campaign.faq.push({ faqId: savedFaq._id });
      let updatedCampaign = await campaign.save();
      return res.json(updatedCampaign);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json({ errors });
    }
  }
);

// @route     POST /api/campaign/amswer
// @fnc       Answering a Question(Only campaign creator can answer)
// @access    private

router.post(
  "/answer",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let errors = {};
    try {
      let campaign = await Campaign.findOne({
        campaignAddress: req.body.address
      });

      // Some validations before updating the answer
      if (!campaign) {
        errors.message = "No campaign with the given address found";
        return res.status(400).json({ errors });
      }
      if (campaign.creatorAddress !== req.user.address) {
        errors.message = "Only the campaign creator can answer the Question";
        return res.status(400).json({ errors });
      }
      let faq = await Faq.findById(req.body.id);
      if (!faq) {
        errors.message = "No Faq found with the given id";
        return res.status(400).json({ errors });
      }

      // Updating the answer
      faq.answer = req.body.answer;
      let savedFaq = await faq.save();

      // Sending the campaign
      return res.json(campaign);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json({ errors });
    }
  }
);

module.exports = router;
