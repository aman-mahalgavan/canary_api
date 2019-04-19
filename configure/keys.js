
const keys_prod = require("./keys_prod");


if (process.env.NODE_ENV === "production") {
  module.exports = keys_prod
}
else {
  const keys_dev = require("./keys_dev");
  module.exports = keys_dev
}



