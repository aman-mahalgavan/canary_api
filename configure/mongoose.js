const mongoose = require("mongoose");




mongoose.Promise = global.Promise;

mongoose.connect(
  process.env.mongoURI,
  { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true },
  (err, db) => {
    if (!err) {
      console.log("Database connected");
    } else {
      console.log(err);
    }
  }
);
