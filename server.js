// Requiring node modules
const express = require("express");
const passport = require("passport");
const passportPrepare = require("./configure/passport");
const mongoose = require("./configure/mongoose");
const bodyParser = require("body-parser");

// Requiring Routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const campaign = require("./routes/api/campaign");

// Instantiating the app
const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Using passport middleware
app.use(passport.initialize());
passportPrepare();

//redirecting the requests to router files
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/campaign", campaign);

// switching the port variable for production and devlopment
let port = process.env.PORT || 12000;

// listening to port 12000
app.listen(port, () => {
  console.log("Server started at port 12000");
});
