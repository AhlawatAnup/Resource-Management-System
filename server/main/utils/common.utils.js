
exports.isValidDuration = function (duration) {
  return Number.isInteger(duration) && duration >= 1 && duration <= 30;
};