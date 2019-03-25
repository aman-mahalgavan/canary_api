const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect(
  "mongodb://localhost:27017/canary",
  { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true },
  (err, db) => {
    if (!err) {
      console.log("Database connected");
    } else {
      console.log(err);
    }
  }
);
