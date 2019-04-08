// requirng modules
const express = require("express");
const Profile = require("../../Models/Profile");
const User  = require("../../Models/User");
const { upload, bucket } = require("../../configure/image-upload-setup");
const uploadToGcs = require("../../utils/uploadToGcs");
const isEmpty = require("../../validation/is-empty");
const validateProfileInputs = require("../../validation/profile");
// const uploadImage = require("../../utils/image-upload-middleware");
const passport = require("passport");

// creating router object
const router = express.Router();

//<-----------------------------------------------Routes------------------------------------------------------------>

// @route     POST /api/profile/create
// @fnc       Creating a User Profile
// @access    private

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  upload.single("avatar"),

  async (req, res) => {
    const { errors, isValid } = validateProfileInputs(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json({ errors });
    }
    try {
      // Checking if the profile already exist
      let userProfile = await Profile.findOne({ user: req.user._id });

      // If user profile exist , update the existing profile
      if (userProfile) {
        errors.message = "Profile already exist";
        return res.status(400).json({ errors });
      }

      let profileFields = {
        handle: req.body.handle,
        location:req.body.location,
        bio: req.body.bio,
        user: req.user._id
      };

      // Checking if a profile with similar handle already exist
      let similarProfile = await Profile.findOne({
        handle: profileFields.handle
      });

      if (similarProfile) {
        errors.handle = "That handle already exists";
        return res.status(400).json({ errors });
      }

      // Uploading the profile image to google cloud services
      profileFields.avatar = await uploadToGcs(req, bucket);

      // Adding the Social fields

      profileFields.social = {};

      if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
      if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
      if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
      if (req.body.instagram)
        profileFields.social.instagram = req.body.instagram;

      // Creating a new profile and then saving it
      let newProfile = new Profile(profileFields);
      savedProfile = await newProfile.save();
      await User.findOneAndUpdate({ _id: req.user._id },{hasProfile:true,avatar:savedProfile.avatar});
      return res.json(savedProfile);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json({ errors });
    }
  }
);

// @route     PUT /api/profile/edit
// @fnc       Editing a User Profile
// @access    private

router.put(
  "/edit",
  passport.authenticate("jwt", { session: false }),
  upload.single("profileImage"),
  async (req, res) => {
    const { errors, isValid } = validateProfileInputs(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json({ errors });
    }
    try {
      // fetching the previous profile
      let userProfile = await Profile.findOne({ user: req.user._id });

      let profileFields = {
        handle: req.body.handle,
        bio: req.body.bio,
        user: req.user._id,
        campaigns: userProfile.campaigns,
        contribution: userProfile.contribution
      };

      // console.log(profileFields);

      // Checking if a profile with similar handle already exist
      let similarProfile = await Profile.findOne({
        handle: profileFields.handle
      });

      // Checking if a profile with the new handle already exist

      if (
        similarProfile &&
        similarProfile.user.toString() !== req.user._id.toString()
      ) {
        errors.handle = "That handle already exists";
        return res.status(400).json({ errors });
      }

      let userAvatar;

      // If profileImage is sent , upload the image to gcd else use the previous image
      if (req.file) {
        userAvatar = await uploadToGcs(req, bucket);
      } else {
        userAvatar = userProfile.avatar;
      }
      profileFields.avatar = userAvatar;

      // Adding the Social fields if exits
      let { social } = userProfile;

      profileFields.social = !isEmpty(social) ? social : {};

      if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
      if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
      if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
      if (req.body.instagram)
        profileFields.social.instagram = req.body.instagram;

      // Updating the already existing profile
      let updatedProfile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true }
      );
      // savedProfile = await updatedProfile.save();
      return res.json(updatedProfile);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json(errors);
    }
  }
);

// @route     GET /api/profile/
// @fnc       Getting the user Profile
// @access    private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let errors = {};

    try {
      // fetching the logged in user profile
      let userProfile = await Profile.findOne({ user: req.user._id });
      if (!userProfile) {
        errors.message = "Profile has not been created yet";
        return res.status(400).json({ errors });
      }
      return res.json(userProfile);
    } catch (err) {
      errors.message = err.message;
      return res.status(400).json(errors);
    }
  }
);

module.exports = router;

// @route     GET /api/profile/:address
// @fnc       Getting the user Profile through ethereum address
// @access    public

router.get("/:address", async (req, res) => {
  let errors = {};
  try {
    let userProfile = await Profile.findByAddress(req.params.address);

    return res.json(userProfile);
  } catch (err) {
    errors.message = err;
    return res.status(400).json({ errors });
  }
});

// @route     GET /api/profile/:id
// @fnc       Getting the user Profile through user Id
// @access    public

router.get("/:id", async (req, res) => {
  let errors = {};
  try {
    let userProfile = await Profile.findOne({ user: req.params.id });
    if (!userProfile) {
      errors.message = "No Profile with the given user Id found";
      return res.status(400).json({ errors });
    }
    return res.json(userProfile);
  } catch (err) {
    errors.message = err;
    return res.status(400).json({ errors });
  }
});
