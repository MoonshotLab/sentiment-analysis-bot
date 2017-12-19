const _ = require('lodash');

// search for substring, case insensitive
function strHas(str, substr) {
  return _.toLower(str).indexOf(_.toLower(substr) >= 0);
}

function mapRange(val, fromLow, fromHigh, toLow, toHigh) {
  const res = toLow + (toHigh - toLow) * (val - fromLow) / (fromHigh - fromLow);
  console.log(res);
  return res;
}

function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

exports.strHas = strHas;
exports.mapRange = mapRange;
exports.randomPick = randomPick;
