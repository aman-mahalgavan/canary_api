const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenSECRET = require("../configure/keys").tokenSECRET;

let userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  Date: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  address: {
    type: String
  },
  hasProfile: {
    type: Boolean,
    default: false
  }
});

// Method for creating hashPassword
userSchema.methods.hashPassword = function () {
  let user = this;
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          return reject(err);
        } else {
          user.password = hash;
          return resolve(user);
        }
      });
    });
  });
};

// Method for creating JWT token for a particular user
userSchema.methods.createJWT = function () {
  const user = this;
  const data = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  return new Promise((resolve, reject) => {
    jwt.sign(data, tokenSECRET, { expiresIn: "42h" }, (err, token) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(token);
      }
    });
  });
};

let User = mongoose.model("users", userSchema);

module.exports = User;
