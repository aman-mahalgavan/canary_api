const passport = require("passport");
const jwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const keys = require("./keys");
const User = require("../Models/User");
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.tokenSECRET;

module.exports = () => {
  passport.use(
    new jwtStrategy(opts, (payload, done) => {
      User.findById(payload.id)
        .then(user => {
          if (user) {
            let { _id, email, name, address } = user;
            return done(null, { _id, email, name, address });
          }
          return done(null, false);
        })
        .catch(e => console.log(e));
    })
  );
};
