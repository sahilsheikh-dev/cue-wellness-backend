// true - you can move forward
// false - you can not move forward

module.exports = function (...values) {
  for (let i = 0; i < values.length; i++) {
    if (values[i] === "" || values[i] === null || values[i] === undefined) {
      return false;
    }
  }

  return true;
};
