const _ = require('lodash');

// search for substring, case insensitive
function strHas(str, substr) {
  return _.toLower(str).indexOf(_.toLower(substr) >= 0);
}

exports.strHas = strHas;
