// requiring node modules
const express = require("express");
const User = require("../../Models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Creating a Router object
const router = express.Router();

//<------------------------------------------ROUTES---------------------------------------------------------->

// @route     POST /api/auth/register
// @fnc       Register a User
// @access    Public

router.post("/register", async (req, res) => {
  let error = {};

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      error.email = "Email already exists";
      return res.status(400).json({ error });
    } else {
      let newUser = new User({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      });

      let hashedUser = await newUser.hashPassword();
      let savedUser = await hashedUser.save();

      return res.json({
        email: savedUser.email,
        name: savedUser.name
      });
    }
  } catch (err) {
    error = err.message;
    return res.status(400).json({ error });
  }
});

// @route     POST /api/auth/login
// @fnc       login a User
// @access    Public

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  errors = {};

  try {
    user = await User.findOne({ email });
    if (user) {
      let isMatch = bcrypt.compare(password, user.password);
      if (isMatch) {
        let token = await user.createJWT();
        res.json({
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
    errors = err.message;
    return res.status(400).json({ errors });
  }
});

module.exports = router;
