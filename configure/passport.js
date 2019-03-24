const passport = require("passport");
const jwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { tokenSECRET } = require("./keys");
const User = require("../Models/User");
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = tokenSECRET;

module.exports = () => {
  passport.use(
    new jwtStrategy(opts, (payload, done) => {
      User.findById(payload.id)
        .then(user => {
          if (user) {
            let { _id, email, name } = user;
            return done(null, { _id, email, name });
          }
          return done(null, false);
        })
        .catch(e => console.log(e));
    })
  );
};
