const _ = require('lodash');

// search for substring, case insensitive
function strHas(str, substr) {
  return _.toLower(str).indexOf(_.toLower(substr) >= 0);
}

function mapRange(val, fromLow, fromHigh, toLow, toHigh) {
  return toLow + (toHigh - toLow) * (val - fromLow) / (fromHigh - fromLow);
}

exports.strHas = strHas;
exports.mapRange = mapRange;
