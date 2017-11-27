'use strict';

module.exports = (str, baseObj) => {
  const options = Object.assign({}, baseObj);
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
