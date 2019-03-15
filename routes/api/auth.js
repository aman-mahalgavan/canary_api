// requiring node modules
const express = require("express");
const User = require("../../Models/User");
const Token = require("../../Models/Token");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const crypto = require("crypto");
const sendMail = require("../../Email/sendMail");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Creating a Router object
const router = express.Router();

//<------------------------------------------ROUTES---------------------------------------------------------->

// @route     POST /api/auth/register
// @fnc       Register a User
// @access    Public

router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  let { email } = req.body;
  if (!isValid) {
    return res.status(400).json({ errors });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json({ error });
    } else {
      let newUser = new User({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      });

      let hashedUser = await newUser.hashPassword();
      let savedUser = await hashedUser.save();

      let token = new Token({
        userId: savedUser._id,
        token: crypto.randomBytes(16).toString("hex")
      });

      let savedToken = await token.save();

      sendMail(savedToken.token, req.headers.host, email, "verify");
      return res.json({
        email: savedUser.email,
        name: savedUser.name
      });
    }
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

// @route     POST /api/auth/login
// @fnc       login a User
// @access    Public

router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  const { email, password } = req.body;
  if (!isValid) {
    return res.status(400).json({ errors });
  }
  try {
    user = await User.findOne({ email });
    if (user) {
      let isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        if (!user.isVerified) {
          errors.verified = `Your email ${user.email} is not yet verified`;
          return res.status(401).send({ errors });
        }
        let token = await user.createJWT();
        return res.json({
          msg: "success",
          token: `Bearer ${token}`
        });
      } else {
        errors.password = "password is incorrect";
        return res.status(400).json({ errors });
      }
    } else {
      errors.email = "User not found";
      return res.status(400).json({ errors });
    }
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

//<--------------------------------------Logic for email confirmation----------------------------------->

// @route     GET /api/auth/confirmation/:token
// @fnc       confirming a user
// @access    Public

router.get("/confirmation/:token", async (req, res) => {
  let { token } = req.params;
  let errors = {};
  try {
    // Finding the details of the token came along request parameters
    let targetToken = await Token.findOne({ token });
    console.log();
    // Notifying the client if no such token exist
    if (!targetToken) {
      errors.tokenExpired = `The token provided is expired. Please create and resend a new token`;
      return res.status(400).json({ errors });
    }

    // If token is found then find the related user
    let targetUser = await User.findOne({ _id: targetToken.userId });

    // Notifying the client if the related user doesnt exist
    if (!targetUser) {
      errors.userNotFound = `User related to this token doesnt exist`;
      return res.status(400).json({ errors });
    }

    // If the user is found in the database then verifying and updating the user
    targetUser.isVerified = true;
    await targetUser.save();
    return res.status(200).json({ msg: "The account has been verified" });
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

// @route     POST /api/auth/resend
// @fnc       resending the confirmation token
// @access    Public

router.post("/resend", async (req, res) => {
  let errors = {};
  let { email } = req.body;

  try {
    // Finding the user with email
    let user = await User.findOne({ email });

    // If no such user exits, notify the client
    if (!user) {
      errors.email = "No user found related to this email";
      return res.status(400).json({ error });
    }

    // If user is verified, no need to resend the token
    if (user.isVerified) {
      errors.email = "Email is already verified";
      return res.status(400).json({ errors });
    }

    // Creating a new token
    let newToken = new Token({
      userId: user._id,
      token: crypto.randomBytes(16).toString("hex")
    });

    // Saving the token into the database
    let savedToken = await newToken.save();

    // sending the confirmation email to the provided email
    sendMail(savedToken.token, req.headers.host, email, "verify");

    // Notifying the user that email has been sent(Not waiting for the email to be sent)
    return res
      .status(200)
      .json({ msg: "A new token has been sent to your email address" });
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

//<--------------------------------------Logic for Resetting the Password---------------------------------->

// @route     POST /api/auth/forgot
// @fnc       sending the password resetting token to the entered email
// @access    Public

router.post("/forgot", async (req, res) => {
  let errors = {};
  let { email } = req.body;

  try {
    // Searching for the user through email

    let user = await User.findOne({ email });
    if (!user) {
      errors.email = `No user found with email address ${email}`;
      return res.status(400).json({ errors });
    }
    // create a new token
    let newToken = new Token({
      userId: user._id,
      token: crypto.randomBytes(16).toString("hex")
    });

    // Saving the token into the database
    let savedToken = await newToken.save();

    // sending the confirmation email to the provided email
    sendMail(savedToken.token, req.headers.host, email, "reset");

    return res
      .status(200)
      .json({ msg: "A reset token has been sent to your Email address" });
  } catch (err) {
    errors.message = err.message;
    return res.status(400).json({ errors });
  }
});

// @route     POST /api/auth/reset
// @fnc       reseting the password using the reset token
// @access    Public

router.post("/reset", async (req, res) => {
  let errors = {};
  let { password, confirmPassword, token } = req.body;

  // Finding the details of the token came along request parameters
  let targetToken = await Token.findOne({ token });

  // Notifying the client if no such token exist
  if (!targetToken) {
    errors.tokenExpired = `The token provided is expired. Please create and resend a new token`;
    return res.status(400).json({ errors });
  }

  // If token is found then find the related user
  let targetUser = await User.findOne({ _id: targetToken.userId });

  // Notifying the client if the related user doesnt exist
  if (!targetUser) {
    errors.userNotFound = `User related to this token doesnt exist`;
    return res.status(400).json({ errors });
  }

  targetUser.password = password;
  let hashedUser = await targetUser.hashPassword();
  let savedUser = await hashedUser.save();

  return res.status(200).json({ msg: "The password has been resetted" });
});

module.exports = router;
