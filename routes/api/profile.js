// requirng modules
const express = require("express");
const Profile = require("../../Models/Profile");
const { upload, bucket } = require("../../configure/image-upload-setup");
const uploadToGcs = require("../../utils/uploadToGcs");
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
  upload.single("profileImage"),

  async (req, res) => {
    let errors = {};
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

      if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
      if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
      if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
      if (req.body.instagram)
        profileFields.social.instagram = req.body.instagram;

      // Creating a new profile and then saving it
      let newProfile = new Profile(profileFields);
      savedProfile = await newProfile.save();
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
    let errors = {};
    try {
      let profileFields = {
        handle: req.body.handle,
        bio: req.body.bio,
        user: req.user._id
      };

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

      // fetching the previous profile
      let userProfile = await Profile.findOne({ user: req.user._id });

      let userAvatar;

      // If profileImage is sent , upload the image to gcd else use the previous image
      if (req.file) {
        userAvatar = await uploadToGcs(req, bucket);
      } else {
        userAvatar = userProfile.avatar;
      }
      profileFields.avatar = userAvatar;
      let savedProfile;

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
      res.status(400).json(errors);
    }
  }
);

module.exports = router;
