'use strict';

module.exports = str => {
  let key, value;
  const obj = {};
  str.split(';').forEach(option => {
    const parts = option.split(':');
    key = parts[0].trim();
    value = parts[1] ? parts[1].trim() : null;
    if (key) {
      obj[key] = value;
    }
  });
  return obj;
};
