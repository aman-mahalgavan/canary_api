module.exports.searchElementInArray = (array, address) => {
  if (array.find(element => element.campaignAddress.toString() === address)) {
    return true;
  } else {
    return false;
  }
};
