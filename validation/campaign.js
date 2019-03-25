const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateCampaignInputs(data, file) {
  let errors = {};

  data.heading = !isEmpty(data.heading) ? data.heading : "";
  data.intro = !isEmpty(data.intro) ? data.intro : "";
  data.about = !isEmpty(data.about) ? data.about : "";
  data.campaignAddress = !isEmpty(data.campaignAddress)
    ? data.campaignAddress
    : "";

  if (isEmpty(file)) {
    errors.headerImage =
      "An Image needs to be uploaded while creating a Campaign";
  }

  if (!Validator.isLength(data.heading, { min: 10, max: 20 })) {
    errors.heading = "Heading needs to between 10 and 20 characters";
  }

  if (!Validator.isLength(data.intro, { min: 10, max: 100 })) {
    errors.intro = "Intro needs to between 10 and 100 characters";
  }

  if (Validator.isEmpty(data.heading)) {
    errors.heading = "Campaign Heading is required";
  }

  if (Validator.isEmpty(data.intro)) {
    errors.intro = " intro field is required";
  }

  if (Validator.isEmpty(data.about)) {
    errors.about = " about field is required";
  }

  if (Validator.isEmpty(data.campaignAddress)) {
    errors.campaignAddress = " campaignAddress is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
