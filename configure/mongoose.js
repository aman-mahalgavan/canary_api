const mongoose = require("mongoose");
const keys = require("./keys");



mongoose.Promise = global.Promise;

mongoose.connect(
  keys.mongoURI,
  { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true },
  (err, db) => {
    if (!err) {
      console.log("Database connected");
    } else {
      console.log(err);
    }
  }
);
