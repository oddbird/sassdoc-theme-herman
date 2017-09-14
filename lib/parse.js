'use strict';

module.exports = {
  sassJson: contents => {
    // Parse the contents of a file containing SassJSON output and return the
    // first SassJSON line found as a JS object.
    const startMarker = '/*! json-encode:';
    const endMarker = '*/';
    const start = contents.indexOf(startMarker);
    const end = contents.indexOf(endMarker, start);
    const jsondata = contents.slice(start + startMarker.length, end);
    return JSON.parse(jsondata);
  },
};
