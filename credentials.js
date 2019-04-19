
const keys_prod = require("./credentials_prod");


if (process.env.NODE_ENV === "production") {
  module.exports = keys_prod
}
else {
  const keys_dev = require("./credentials_dev");
  module.exports = keys_dev
}






