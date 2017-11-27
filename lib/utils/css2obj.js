'use strict';

module.exports = (str, baseObj) => {
  let options = {};
  if (baseObj) {
    options = Object.assign(options, baseObj);
  }
  let key, value;
  str.split(';').forEach(option => {
    const parts = option.split(':');
    key = parts[0].trim();
    value = parts[1] ? parts[1].trim() : null;
    if (key) {
      options[key] = value;
    }
  });
  return options;
};
